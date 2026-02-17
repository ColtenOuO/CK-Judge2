import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    Plus,
    ArrowLeft,
    ChevronRight,
    Trophy,
    BookOpen,
    X,
    Save
} from 'lucide-react';
import client from '../api/client';

interface Contest {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    type: string;
    is_active: boolean;
}

interface UserProfile {
    is_superuser: boolean;
}

interface ContestListProps {
    variant: 'Contest' | 'Homework';
}

const ContestList: React.FC<ContestListProps> = ({ variant }) => {
    const navigate = useNavigate();
    const [contests, setContests] = useState<Contest[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
    });

    useEffect(() => {
        fetchData();
    }, [variant]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contestsRes, userRes] = await Promise.all([
                client.get(`/contests/?type=${variant.toUpperCase()}`),
                client.get('/users/me')
            ]);
            setContests(contestsRes.data);
            setUser(userRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/contests/', {
                ...formData,
                type: variant.toUpperCase(),
                is_active: true
            });
            setIsCreating(false);
            setFormData({ title: '', description: '', start_time: '', end_time: '' });
            fetchData();
        } catch (err) {
            console.error("Failed to create", err);
            alert("Failed to create. Please check inputs.");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (now < startDate) return { label: 'Upcoming', color: 'text-blue-400 border-blue-500/20 bg-blue-500/10' };
        if (now > endDate) return { label: 'Ended', color: 'text-slate-500 border-slate-500/20 bg-slate-500/10' };
        return { label: 'Running', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 animate-pulse' };
    };

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
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${variant === 'Contest' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                {variant === 'Contest' ? <Trophy className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight mb-2">{variant === 'Contest' ? 'Contests' : 'Homework'}</h1>
                                <p className="text-slate-400 text-lg">
                                    {variant === 'Contest'
                                        ? 'Compete with others and prove your skills.'
                                        : 'Complete assignments to master the concepts.'}
                                </p>
                            </div>
                        </div>

                        {user?.is_superuser && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                Create {variant}
                            </button>
                        )}
                    </div>
                </header>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {contests.map((contest) => {
                        const status = getStatus(contest.start_time, contest.end_time);
                        return (
                            <motion.div
                                key={contest.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {contest.title}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full border font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 mb-4 line-clamp-2">{contest.description || "No description provided."}</p>

                                        <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Start: {formatDate(contest.start_time)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>End: {formatDate(contest.end_time)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/${variant.toLowerCase()}s/${contest.id}`)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                                    >
                                        Enter {variant}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}

                    {contests.length === 0 && (
                        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                            <div className="text-slate-500 text-lg">No {variant.toLowerCase()}s found.</div>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {isCreating && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-full max-w-lg shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-white">Create New {variant}</h3>
                                    <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Start Time</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.start_time}
                                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                                                style={{ colorScheme: 'dark' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">End Time</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.end_time}
                                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                                                style={{ colorScheme: 'dark' }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            Create {variant}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ContestList;
