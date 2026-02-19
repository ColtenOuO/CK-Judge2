import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Clock,
    Database,
    ChevronLeft,
    Send,
    Code as CodeIcon,
    Terminal,
    BookOpen
} from 'lucide-react';
import client from '../api/client';

const ProblemDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [problem, setProblem] = useState<any>(null);
    const [testCases, setTestCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');

    const backUrl = location.state?.backUrl || '/problems';
    const contextTitle = location.state?.contextTitle;
    const contextType = location.state?.contextType || 'Problem List';
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const [probRes, tcRes] = await Promise.all([
                    client.get(`/problems/${id}`),
                    client.get(`/problems/${id}/test_cases`)
                ]);
                setProblem(probRes.data);
                setTestCases(tcRes.data.filter((tc: any) => tc.is_sample));
                setLoading(false);
            } catch (err) {
                console.error("Fetch problem error", err);
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const handleSubmit = async () => {
        // Submission logic will go here
        alert("Submission functionality coming soon!");
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    if (!problem) return <div className="min-h-screen bg-slate-950 text-white p-8">Problem not found.</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(backUrl)}
                            className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm hidden md:block">
                                Back to {contextTitle || (backUrl === '/problems' ? 'Problems' : contextType)}
                            </span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                            <div className="flex items-center gap-4 mt-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}>
                                    {problem.difficulty}
                                </span>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    {problem.time_limit}ms
                                </div>
                                <Database className="w-3.5 h-3.5" />
                                {problem.memory_limit}MB
                            </div>
                        </div>
                        {problem.tags && problem.tags.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {problem.tags.map((tag: any) => (
                                    <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Problem Description */}
                <div className="space-y-8 h-[calc(100vh-180px)] overflow-y-auto pr-4 custom-scrollbar">
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Description
                        </h2>
                        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {problem.description}
                        </div>
                    </section>

                    {problem.is_partial && (
                        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CodeIcon className="w-4 h-4" />
                                Reference main.cpp (Students)
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">You only need to implement the required functions. Use this main.cpp for local testing.</p>
                            <pre className="bg-slate-950 p-4 rounded-lg text-slate-300 text-xs font-mono overflow-x-auto border border-white/5 max-h-96">
                                {problem.main_code || "// No reference code provided."}
                            </pre>
                        </section>
                    )}

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Input Format</h3>
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg text-slate-300 text-sm italic">
                                {problem.input_description}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Output Format</h3>
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg text-slate-300 text-sm italic">
                                {problem.output_description}
                            </div>
                        </div>
                    </section>

                    {testCases.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Sample Test Cases</h2>
                            <div className="space-y-4">
                                {testCases.map((tc, idx) => (
                                    <div key={tc.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                        <div className="bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-400 flex justify-between">
                                            <span>Sample Case #{idx + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-2 border-t border-slate-800">
                                            <div className="p-4 border-r border-slate-800">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Input</div>
                                                <pre className="text-xs font-mono text-cyan-400 bg-black/30 p-2 rounded whitespace-pre-wrap">{tc.input_data}</pre>
                                            </div>
                                            <div className="p-4">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Output</div>
                                                <pre className="text-xs font-mono text-emerald-400 bg-black/30 p-2 rounded whitespace-pre-wrap">{tc.output_data}</pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right: Code Editor (Mockup) */}
                <div className="flex flex-col h-[calc(100vh-180px)]">
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">Implementation</span>
                            </div>
                            <select className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 text-slate-300 outline-none">
                                <option>C++ 17</option>
                            </select>
                        </div>
                        <div className="flex-1 relative group">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full bg-slate-950 p-6 text-cyan-50 font-mono text-sm resize-none focus:outline-none placeholder:text-slate-700"
                                placeholder={problem.is_partial ? "// Implement the required functions here..." : "// Write your code here..."}
                            />
                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-slate-900/80 text-[10px] px-2 py-1 rounded text-slate-500 italic">Ln 1, Col 1</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                                Submit Solution
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProblemDetails;
