import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import JSZip from 'jszip';
import {
    CheckCircle,
    XCircle,
    ChevronLeft,
    AlertTriangle,
    RefreshCw,
    Download,
    Code
} from 'lucide-react';

interface SubmissionSnippet {
    id: string;
    user_id: string;
    username: string;
    problem_id: string;
    problem_title?: string;
    language: string;
    status: string;
    total_score: number;
    time_used: number;
    memory_used: number;
    created_at: string;
    code: string;
}

const AdminSubmissions: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [submissions, setSubmissions] = useState<SubmissionSnippet[]>([]);
    const [loading, setLoading] = useState(true);

    const queryParams = new URLSearchParams(location.search);
    const problemIdFilter = queryParams.get('problem_id');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                let url = '/submissions/?limit=500';
                if (problemIdFilter) {
                    url += `&problem_id=${problemIdFilter}`;
                }
                const res = await client.get(url);
                setSubmissions(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch admin submissions", err);
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [problemIdFilter]);

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
            case 'Accepted': return <CheckCircle className="w-4 h-4" />;
            case 'Wrong Answer': return <XCircle className="w-4 h-4" />;
            case 'Pending':
            case 'Judging': return <RefreshCw className="w-4 h-4 animate-spin" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const handleDownload = (e: React.MouseEvent, sub: SubmissionSnippet) => {
        e.stopPropagation();

        const extMap: Record<string, string> = {
            'C++': 'cpp',
            'Python': 'py',
            'C': 'c'
        };
        const ext = extMap[sub.language] || 'txt';
        const safeTitle = (sub.problem_title || sub.problem_id.substring(0, 8)).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${sub.username}_${safeTitle}_${sub.id.substring(0, 8)}.${ext}`;

        const blob = new Blob([sub.code || "// Code snippet not loaded natively by default API view."], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadAll = async () => {
        if (submissions.length === 0) return;

        const zip = new JSZip();

        submissions.forEach(sub => {
            const extMap: Record<string, string> = {
                'C++': 'cpp',
                'Python': 'py',
                'C': 'c'
            };
            const ext = extMap[sub.language] || 'txt';
            const safeTitle = (sub.problem_title || sub.problem_id.substring(0, 8)).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `${sub.username}_${safeTitle}_${sub.id.substring(0, 8)}.${ext}`;
            zip.file(filename, sub.code || "// Code snippet not loaded natively by default API view.");
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submissions_${problemIdFilter || 'all'}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(problemIdFilter ? `/problems/${problemIdFilter}` : '/dashboard')}
                        className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {problemIdFilter ? 'Back to Problem' : 'Dashboard'}
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Code className="w-5 h-5 text-cyan-400" />
                            All Submissions {problemIdFilter ? '(Filtered)' : ''}
                        </h1>
                        {submissions.length > 0 && (
                            <button
                                onClick={handleDownloadAll}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download ZIP
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">ID</th>
                                    <th className="p-4 font-bold">Username</th>
                                    <th className="p-4 font-bold">Problem</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold text-center">Score</th>
                                    <th className="p-4 font-bold text-right">Metrics</th>
                                    <th className="p-4 font-bold text-right">Date</th>
                                    <th className="p-4 font-bold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                                            No submissions found.
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((sub) => (
                                        <tr
                                            key={sub.id}
                                            onClick={() => navigate(`/submissions/${sub.id}`)}
                                            className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                                        >
                                            <td className="p-4 text-xs font-mono text-slate-500 group-hover:text-cyan-400">
                                                #{sub.id.slice(0, 8)}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-indigo-400">
                                                {sub.username || 'Unknown'}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-slate-300">
                                                {sub.problem_title || sub.problem_id.substring(0, 8)}
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-bold ${getStatusColor(sub.status)}`}>
                                                    {getStatusIcon(sub.status)}
                                                    {sub.status}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold ${sub.total_score === 100 ? 'text-emerald-400' : sub.total_score > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                                                    {sub.total_score}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-xs font-mono text-slate-400 whitespace-nowrap">
                                                {sub.time_used}ms | {sub.memory_used}KB
                                            </td>
                                            <td className="p-4 text-right text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(sub.created_at).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={(e) => handleDownload(e, sub)}
                                                    className="p-2 bg-slate-800 hover:bg-cyan-600 hover:text-white rounded-lg text-cyan-400 transition-colors inline-block"
                                                    title="Download Source Code"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSubmissions;
