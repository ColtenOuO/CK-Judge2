import os
import time
import subprocess
import signal
import uuid
import logging
import resource
import psutil
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CGROUP_ROOT = "/sys/fs/cgroup"
CGROUP_CPU = os.path.join(CGROUP_ROOT, "cpu")
CGROUP_MEMORY = os.path.join(CGROUP_ROOT, "memory")

class Sandbox:
    def __init__(self, cgroup_name: str = None):
        self.cgroup_name = cgroup_name or f"judge_worker_{uuid.uuid4().hex}"
        self.cpu_cgroup_path = os.path.join(CGROUP_CPU, self.cgroup_name)
        self.mem_cgroup_path = os.path.join(CGROUP_MEMORY, self.cgroup_name)

    def _setup_cgroup(self, cpu_limit_ms: int, mem_limit_mb: int):
        try:
            if not os.path.exists(self.cpu_cgroup_path):
                os.makedirs(self.cpu_cgroup_path)
            
            with open(os.path.join(self.cpu_cgroup_path, "cpu.cfs_period_us"), "w") as f:
                f.write("100000")
            with open(os.path.join(self.cpu_cgroup_path, "cpu.cfs_quota_us"), "w") as f:
                f.write("100000") 

            if not os.path.exists(self.mem_cgroup_path):
                os.makedirs(self.mem_cgroup_path)
            
            limit_bytes = mem_limit_mb * 1024 * 1024
            with open(os.path.join(self.mem_cgroup_path, "memory.limit_in_bytes"), "w") as f:
                f.write(str(limit_bytes))

        except Exception as e:
            logger.error(f"Failed to setup cgroup: {e}")
            raise

    def _add_pid_to_cgroup(self, pid: int):
        try:
            with open(os.path.join(self.cpu_cgroup_path, "cgroup.procs"), "w") as f:
                f.write(str(pid))
            with open(os.path.join(self.mem_cgroup_path, "cgroup.procs"), "w") as f:
                f.write(str(pid))
        except Exception as e:
            logger.error(f"Failed to add pid to cgroup: {e}")
            raise

    def _cleanup_cgroup(self):
        try:
            if os.path.exists(self.cpu_cgroup_path):
                os.rmdir(self.cpu_cgroup_path)
            if os.path.exists(self.mem_cgroup_path):
                os.rmdir(self.mem_cgroup_path)
        except Exception as e:
            logger.warning(f"Failed to cleanup cgroup: {e}")

    def _preexec_fn(self):
        resource.setrlimit(resource.RLIMIT_FSIZE, (64 * 1024 * 1024, 64 * 1024 * 1024))
        
        try:
            import seccomp
            f = seccomp.SyscallFilter(defaction=seccomp.KILL)
            
            allowed_syscalls = [
                'read', 'write', 'open', 'close', 'stat', 'fstat', 'lseek', 'brk', 'mmap', 'munmap',
                'access', 'execve', 'exit', 'exit_group', 'arch_prctl', 'time', 'gettimeofday', 
                'sysinfo', 'getcwd', 'readlink', 'uname', 'futex', 'lstat', 'readlink', 'fcntl'
            ]
            
            for call in allowed_syscalls:
                f.add_rule(seccomp.ALLOW, call)
                
            f.load()
            
        except ImportError:
            pass
        except Exception:
            pass

    def run(self, 
            command: list, 
            stdin_path: str = None, 
            stdout_path: str = None, 
            stderr_path: str = None,
            time_limit_ms: int = 1000, 
            memory_limit_mb: int = 256
        ) -> Dict[str, Any]:
        
        result = {
            "status": "Accepted",
            "time_used_ms": 0,
            "memory_used_kb": 0,
            "return_code": 0
        }

        try:
            self._setup_cgroup(time_limit_ms, memory_limit_mb)
        except Exception:
            result["status"] = "Internal Error (Cgroup Setup)"
            return result

        stdin_file = open(stdin_path, "r") if stdin_path else None
        stdout_file = open(stdout_path, "w") if stdout_path else None
        stderr_file = open(stderr_path, "w") if stderr_path else None

        process = None
        start_time = time.time()

        try:
            process = subprocess.Popen(
                command,
                stdin=stdin_file,
                stdout=stdout_file,
                stderr=stderr_file,
                preexec_fn=self._preexec_fn,
                cwd=None,
                env=None
            )
            
            self._add_pid_to_cgroup(process.pid)

            ps_proc = psutil.Process(process.pid)
            
            while process.poll() is None:
                if (time.time() - start_time) * 1000 > time_limit_ms * 2:
                    process.kill()
                    result["status"] = "Time Limit Exceeded"
                    break
                
                try:
                    mem_info = ps_proc.memory_info()
                    result["memory_used_kb"] = max(result["memory_used_kb"], mem_info.rss / 1024)
                    
                    if result["memory_used_kb"] > memory_limit_mb * 1024:
                        process.kill()
                        result["status"] = "Memory Limit Exceeded"
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                     break
                
                time.sleep(0.01)

            process.wait()
            end_time = time.time()
            result["time_used_ms"] = int((end_time - start_time) * 1000)
            result["return_code"] = process.returncode

            if result["status"] == "Accepted":
                if process.returncode != 0:
                    if process.returncode == -signal.SIGKILL: 
                        if result["memory_used_kb"] > memory_limit_mb * 1024 * 0.9:
                            result["status"] = "Memory Limit Exceeded"
                        else:
                             result["status"] = "Time Limit Exceeded"
                    elif process.returncode == -signal.SIGSEGV:
                         result["status"] = "Runtime Error (SIGSEGV)"
                    elif process.returncode == -signal.SIGSYS:
                         result["status"] = "Runtime Error (System Call Forbidden)"
                    else:
                         result["status"] = "Runtime Error (Non-zero exit)"

        except Exception as e:
            logger.error(f"Execution failed: {e}")
            result["status"] = "Internal Error"
        finally:
            if stdin_file: stdin_file.close()
            if stdout_file: stdout_file.close()
            if stderr_file: stderr_file.close()
            self._cleanup_cgroup()

        return result
