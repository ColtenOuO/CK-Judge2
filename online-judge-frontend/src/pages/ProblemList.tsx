import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    Edit,
    Trash2,
    Plus,
    ArrowLeft,
    ChevronRight,
    Lock,
    Unlock
} from 'lucide-react';
import client from '../api/client';

interface Problem {
    id: string;
    title: string;
    difficulty: string;
    is_active: boolean;
    created_at: string;
}

interface UserProfile {
    is_superuser: boolean;
}

const ProblemList: React.FC = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [problemsRes, userRes] = await Promise.all([
                    client.get('/problems/'),
                    client.get('/users/me')
                ]);
                setProblems(problemsRes.data);
                setUser(userRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete problem "${title}"?`)) return;

        try {
            await client.delete(`/problems/${id}`);
            setProblems(problems.filter(p => p.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete problem");
        }
    };

    const filteredProblems = problems.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2">Problem Set</h1>
                            <p className="text-slate-400 text-lg">Sharpen your skills with our curated challenges.</p>
                        </div>

                        {user?.is_superuser && (
                            <button
                                onClick={() => navigate('/admin/create-problem')}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                Create Problem
                            </button>
                        )}
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search problems by title..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 transition-all text-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Problems Table */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Difficulty</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredProblems.map((problem) => (
                                    <motion.tr
                                        key={problem.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-800/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            {problem.is_active ? (
                                                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                                    <Unlock className="w-4 h-4" />
                                                    <span>Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                    <Lock className="w-4 h-4" />
                                                    <span>Private</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                                                {problem.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {user?.is_superuser && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/admin/problems/${problem.id}/edit`)}
                                                            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                            title="Edit Problem"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(problem.id, problem.title)}
                                                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                            title="Delete Problem"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/problems/${problem.id}`)}
                                                    className="p-2 text-slate-400 hover:text-white transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {filteredProblems.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            No problems found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemList;
