import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Code2, Cpu } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-cyan-500 selection:text-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col justify-center items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <div className="flex justify-center mb-6 space-x-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Cpu className="w-16 h-16 text-cyan-400" />
                        </motion.div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight">
                        NCKU CSIE PD2
                    </h1>
                    <h2 className="text-3xl md:text-5xl font-light mb-8 text-slate-300">
                        Online Judge
                    </h2>

                    <p className="max-w-xl mx-auto text-slate-400 mb-12 text-lg">
                        Advanced algorithmic evaluation platform for the next generation of engineers.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="group relative px-8 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-lg overflow-hidden transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 font-semibold text-lg">
                            <Terminal className="w-5 h-5" />
                            ENTER SYSTEM
                        </span>
                    </motion.button>
                </motion.div>

                {/* Footer decorations */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-slate-600 text-sm">
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        <span>v2.0.0-beta</span>
                    </div>
                    <div>© 2026 NCKU CSIE</div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
