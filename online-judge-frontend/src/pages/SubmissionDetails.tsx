import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import {
    CheckCircle,
    XCircle,
    Clock,
    Database,
    ChevronLeft,
    AlertTriangle,
    Code,
    Cpu,
    RefreshCw
} from 'lucide-react';

interface SubmissionDetail {
    id: string;
    problem_id: string;
    language: string;
    status: string;
    total_score: number;
    time_used: number;
    memory_used: number;
    code: string;
    created_at: string;
    details?: {
        test_case_id: string;
        status: string;
        time_ms: number;
        memory_kb: number;
        return_code: number;
    }[];
}

const SubmissionDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSubmission = async () => {
        try {
            const res = await client.get(`/submissions/${id}`);
            setSubmission(res.data);
            setLoading(false);

            // Continue polling if status is Pending or Judging
            if (res.data.status === 'Pending' || res.data.status === 'Judging') {
                setTimeout(fetchSubmission, 2000);
            }
        } catch (err) {
            console.error("Failed to fetch submission", err);
            setError("Failed to load submission details.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmission();
        // Cleanup not strictly necessary for simple timeout but good practice would be useRef for timer
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Wrong Answer': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'Compilation Error': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Time Limit Exceeded': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'Runtime Error': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'Pending':
            case 'Judging': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Accepted': return <CheckCircle className="w-5 h-5" />;
            case 'Wrong Answer': return <XCircle className="w-5 h-5" />;
            case 'Pending':
            case 'Judging': return <RefreshCw className="w-5 h-5 animate-spin" />;
            default: return <AlertTriangle className="w-5 h-5" />;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    if (error || !submission) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400">
            {error || "Submission not found"}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(`/problems/${submission.problem_id}`)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Problem
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-3">
                        Submission #{submission.id.slice(0, 8)}
                    </h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Status Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${getStatusColor(submission.status).replace('text-', 'bg-').split(' ')[0]} bg-opacity-20`}>
                                {getStatusIcon(submission.status)}
                            </div>
                            <div>
                                <h2 className={`text-2xl font-bold ${getStatusColor(submission.status).split(' ')[0]}`}>
                                    {submission.status}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Submitted on {new Date(submission.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 text-sm">
                            <div className="flex flex-col items-center p-3 bg-slate-950 rounded-lg border border-slate-800 min-w-[100px]">
                                <span className="text-slate-500 text-xs uppercase font-bold mb-1">Score</span>
                                <span className="text-2xl font-bold text-white">{submission.total_score}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-slate-950 rounded-lg border border-slate-800 min-w-[100px]">
                                <span className="text-slate-500 text-xs uppercase font-bold mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
                                <span className="text-xl font-mono text-cyan-400">{submission.time_used}ms</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-slate-950 rounded-lg border border-slate-800 min-w-[100px]">
                                <span className="text-slate-500 text-xs uppercase font-bold mb-1 flex items-center gap-1"><Database className="w-3 h-3" /> Memory</span>
                                <span className="text-xl font-mono text-purple-400">{submission.memory_used}KB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Cases */}
                {submission.details && submission.details.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-slate-500" />
                            Test Case Results
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {submission.details.map((tc, idx) => (
                                <div key={idx} className={`bg-slate-900 border ${tc.status === 'Accepted' ? 'border-emerald-500/20' : 'border-rose-500/20'} rounded-lg p-4 transition-all hover:bg-slate-800`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Case #{idx + 1}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${tc.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {tc.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tc.time_ms}ms</span>
                                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {tc.memory_kb}KB</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Source Code */}
                <section>
                    <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-slate-500" />
                        Source Code
                        <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded ml-2">{submission.language}</span>
                    </h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-4 overflow-x-auto">
                            <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                                {submission.code}
                            </pre>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SubmissionDetails;
