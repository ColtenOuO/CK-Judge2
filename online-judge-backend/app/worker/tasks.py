import os
import shutil
import subprocess
import logging
from app.core.celery_app import celery_app
from app import crud, models
from app.db.session import SessionLocal
from app.worker.sandbox import Sandbox

logger = logging.getLogger(__name__)

TEMP_DIR = "/tmp/judge_workspace"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

@celery_app.task
def judge_submission(submission_id: str):
    db = SessionLocal()
    submission = None
    try:
        submission = crud.submission.get(db, id=submission_id)
        if not submission:
            logger.error(f"Submission {submission_id} not found.")
            return

        crud.submission.update_status(db, submission_id=submission.id, status="Judging")
        
        problem = submission.problem
        language = submission.language
        code = submission.code

        workspace = os.path.join(TEMP_DIR, str(submission_id))
        if not os.path.exists(workspace):
            os.makedirs(workspace)

        filename = "main"
        extension = ".py" if language == "Python" else ".cpp" if language == "C++" else ".c"
        code_path = os.path.join(workspace, f"{filename}{extension}")
        
        with open(code_path, "w") as f:
            f.write(code)

        executable_cmd = []
        compile_error = None

        if language == "Python":
            executable_cmd = ["python3", code_path]
        elif language == "C++":
            exe_path = os.path.join(workspace, "main.out")
            compile_cmd = ["g++", code_path, "-o", exe_path, "-O2"]
            try:
                subprocess.check_output(compile_cmd, stderr=subprocess.STDOUT)
                executable_cmd = [exe_path]
            except subprocess.CalledProcessError as e:
                compile_error = e.output.decode()
        
        if compile_error:
            crud.submission.update_result(
                db, 
                submission_id=submission.id, 
                status="Compilation Error", 
                total_score=0,
                time_used=0,
                memory_used=0,
                details={"error": compile_error}
            )
            return

        test_cases = problem.test_cases
        
        total_score = 0
        max_time = 0
        max_memory = 0
        results_detail = []
        final_status = "Accepted"
        
        sandbox = Sandbox()

        if not test_cases:
             final_status = "Skipped (No Test Cases)"

        for idx, tc in enumerate(test_cases):
            input_path = os.path.join(workspace, f"{idx}.in")
            output_path = os.path.join(workspace, f"{idx}.out")
            
            with open(input_path, "w") as f:
                f.write(tc.input_data)
            
            limit_time = getattr(problem, "time_limit", 1000)
            limit_mem = getattr(problem, "memory_limit", 256)

            res = sandbox.run(
                command=executable_cmd,
                stdin_path=input_path,
                stdout_path=output_path,
                stderr_path=os.path.join(workspace, f"{idx}.err"),
                time_limit_ms=limit_time,
                memory_limit_mb=limit_mem
            )

            if res["status"] == "Accepted":
                actual_output = ""
                with open(output_path, "r") as f:
                    actual_output = f.read().strip()
                
                expected_output = tc.output_data.strip()
                if actual_output == expected_output:
                    res["status"] = "Accepted"
                    score = 100 / len(test_cases)
                    total_score += score
                else:
                    res["status"] = "Wrong Answer"
                    final_status = "Wrong Answer"
            else:
                final_status = res["status"]

            max_time = max(max_time, res["time_used_ms"])
            max_memory = max(max_memory, res["memory_used_kb"])

            results_detail.append({
                "test_case_id": str(tc.id),
                "status": res["status"],
                "time_ms": res["time_used_ms"],
                "memory_kb": res["memory_used_kb"],
                "return_code": res["return_code"]
            })

        crud.submission.update_result(
            db,
            submission_id=submission.id,
            status=final_status,
            total_score=int(total_score),
            time_used=max_time,
            memory_used=int(max_memory),
            details=results_detail
        )

    except Exception as e:
        logger.error(f"Judge Error: {e}")
        if submission:
            crud.submission.update_status(db, submission_id=submission.id, status="System Error")
    finally:
        if os.path.exists(workspace):
            shutil.rmtree(workspace)
        db.close()
