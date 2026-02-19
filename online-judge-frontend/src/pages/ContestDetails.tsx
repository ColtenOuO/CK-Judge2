import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    ArrowLeft,
    Trophy,
    BookOpen,
    AlertCircle,
    MoreVertical,
    Trash2,
    Plus,
    X,
    Search,
    Save
} from 'lucide-react';
import client from '../api/client';

interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    tags: any[];
}

interface ContestProblem {
    problem_id: string;
    score: number;
    order: number;
    problem?: {
        title: string;
    };
}

interface Contest {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    type: string;
    is_active: boolean;
    is_visible: boolean;
    contest_problems: ContestProblem[];
}

interface UserProfile {
    is_superuser: boolean;
}

const ContestDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Admin Management State
    const [isManaging, setIsManaging] = useState(false);
    const [allProblems, setAllProblems] = useState<Problem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingProblems, setEditingProblems] = useState<ContestProblem[]>([]);

    // Edit Settings State
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        is_visible: true
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contestRes, userRes] = await Promise.all([
                client.get(`/contests/${id}`),
                client.get('/users/me')
            ]);
            setContest(contestRes.data);
            setUser(userRes.data);
            setEditingProblems(contestRes.data.contest_problems || []);

            // Helper for UTC to Local ISO (for datetime-local input)
            const toLocalISOString = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const offset = date.getTimezoneOffset() * 60000;
                const localDate = new Date(date.getTime() - offset);
                return localDate.toISOString().slice(0, 16);
            };

            setSettingsForm({
                title: contestRes.data.title,
                description: contestRes.data.description || '',
                start_time: toLocalISOString(contestRes.data.start_time),
                end_time: toLocalISOString(contestRes.data.end_time),
                is_visible: contestRes.data.is_visible
            });
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError("Failed to load contest details.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Helper for Local to UTC ISO
            const toUTCString = (localDateStr: string) => {
                return new Date(localDateStr).toISOString();
            };

            const payload = {
                ...settingsForm,
                start_time: toUTCString(settingsForm.start_time),
                end_time: toUTCString(settingsForm.end_time)
            };

            await client.put(`/contests/${id}`, payload);
            setIsEditingSettings(false);
            fetchData();
            alert("Settings updated successfully!");
        } catch (err) {
            console.error("Failed to update settings", err);
            alert("Failed to update settings.");
        }
    };

    const fetchAllProblems = async () => {
        try {
            const res = await client.get('/problems/?limit=1000'); // Fetch all for now
            setAllProblems(res.data);
        } catch (err) {
            console.error("Failed to fetch problems", err);
        }
    };

    const handleOpenManage = () => {
        setIsManaging(true);
        fetchAllProblems();
        setEditingProblems(contest?.contest_problems || []);
    };

    const handleAddProblem = (problem: Problem) => {
        if (editingProblems.some(p => p.problem_id === problem.id)) return;

        const newProblem: ContestProblem = {
            problem_id: problem.id,
            score: 100,
            order: editingProblems.length + 1,
            problem: { title: problem.title }
        };
        setEditingProblems([...editingProblems, newProblem]);
    };

    const handleRemoveProblem = (problem_id: string) => {
        setEditingProblems(editingProblems.filter(p => p.problem_id !== problem_id));
    };

    const handleSaveProblems = async () => {
        if (!contest) return;
        try {
            // Prepare payload
            // The API expects 'problems' list in ContestUpdate
            const payload = {
                problems: editingProblems.map(p => ({
                    problem_id: p.problem_id,
                    score: p.score,
                    order: p.order
                }))
            };

            await client.put(`/contests/${contest.id}`, payload);
            setIsManaging(false);
            fetchData(); // Refresh
        } catch (err) {
            console.error("Failed to update contest problems", err);
            alert("Failed to save changes.");
        }

    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete this ${contest?.type}? This action cannot be undone.`)) {
            return;
        }
        try {
            await client.delete(`/contests/${id}`);
            navigate(contest?.type === 'Homework' ? '/homeworks' : '/contests');
        } catch (err) {
            console.error("Failed to delete contest", err);
            alert("Failed to delete.");
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

    if (error || !contest) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6 mr-2" />
            {error || "Contest not found"}
        </div>
    );

    const status = getStatus(contest.start_time, contest.end_time);
    const filteredAvailableProblems = allProblems.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !editingProblems.some(ep => ep.problem_id === p.id)
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-10">
                    <button
                        onClick={() => navigate(contest.type === 'Homework' ? '/homeworks' : '/contests')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to {contest.type === 'Homework' ? 'Homeworks' : 'Contests'}
                    </button>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${contest.type === 'Contest' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                    {contest.type === 'Contest' ? <Trophy className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                                        {contest.title}
                                        {!contest.is_visible && (
                                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">HIDDEN</span>
                                        )}
                                    </h1>
                                    <span className={`text-xs px-2 py-1 rounded-full border font-bold ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>

                            {user?.is_superuser && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingSettings(true)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={handleOpenManage}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Manage Problems
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="text-slate-400 mb-6 text-lg">{contest.description}</p>

                        <div className="flex flex-wrap gap-8 text-slate-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-500" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Start Time</div>
                                    <div className="text-white">{formatDate(contest.start_time)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-500" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">End Time</div>
                                    <div className="text-white">{formatDate(contest.end_time)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Problems List */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-6">Problems</h2>

                    {contest.contest_problems.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                            <p className="text-slate-500">No problems added yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {contest.contest_problems
                                .sort((a, b) => a.order - b.order)
                                .map((cp, index) => (
                                    <motion.div
                                        key={cp.problem_id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate(`/problems/${cp.problem_id}`)}
                                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors">
                                                    {cp.problem?.title || "Unknown Problem"}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-sm font-bold text-slate-500 px-3 py-1 bg-slate-950 rounded border border-slate-800">
                                                {cp.score} pts
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Edit Settings Modal */}
                <AnimatePresence>
                    {isEditingSettings && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-8"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-white">Edit Settings</h3>
                                    <button onClick={() => setIsEditingSettings(false)} className="text-slate-400 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleUpdateSettings} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={settingsForm.title}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                        <textarea
                                            value={settingsForm.description}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                                            rows={3}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                                            <input
                                                type="datetime-local"
                                                value={settingsForm.start_time}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, start_time: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                                                style={{ colorScheme: 'dark' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                                            <input
                                                type="datetime-local"
                                                value={settingsForm.end_time}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, end_time: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                                                style={{ colorScheme: 'dark' }}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="edit_is_visible"
                                            checked={settingsForm.is_visible}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, is_visible: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-800 text-cyan-600 focus:ring-cyan-600 bg-slate-950"
                                        />
                                        <label htmlFor="edit_is_visible" className="text-sm text-slate-400">
                                            Visible to students
                                        </label>
                                    </div>
                                    <div className="pt-4 flex justify-between items-center">
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete {contest?.type}
                                        </button>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingSettings(false)}
                                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save Settings
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Manage Modal */}
                <AnimatePresence>
                    {isManaging && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl"
                            >
                                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                    <h3 className="text-2xl font-bold text-white">Manage Problems</h3>
                                    <button onClick={() => setIsManaging(false)} className="text-slate-400 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
                                    {/* Left: Current Problems */}
                                    <div className="flex-1 p-6 overflow-y-auto w-full md:w-1/2">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Selected Problems</h4>
                                        <div className="space-y-2">
                                            {editingProblems.length === 0 && (
                                                <p className="text-slate-500 text-sm italic">No problems selected.</p>
                                            )}
                                            {editingProblems.map((p, idx) => (
                                                <div key={p.problem_id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-3 group">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-slate-500 font-mono text-sm">{idx + 1}.</span>
                                                            <span className="font-medium text-slate-300">
                                                                {p.problem?.title || allProblems.find(ap => ap.id === p.problem_id)?.title || "Loading..."}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveProblem(p.problem_id)}
                                                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-4 pl-7">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Score</label>
                                                            <input
                                                                type="number"
                                                                value={p.score}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    setEditingProblems(editingProblems.map(ep =>
                                                                        ep.problem_id === p.problem_id ? { ...ep, score: val } : ep
                                                                    ));
                                                                }}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Order</label>
                                                            <input
                                                                type="number"
                                                                value={p.order}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    setEditingProblems(editingProblems.map(ep =>
                                                                        ep.problem_id === p.problem_id ? { ...ep, order: val } : ep
                                                                    ));
                                                                }}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Add Problems */}
                                    <div className="flex-1 p-6 flex flex-col w-full md:w-1/2 bg-slate-950/30">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Add Problems</h4>
                                        <div className="relative mb-4">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Search problems..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-2">
                                            {filteredAvailableProblems.slice(0, 20).map(problem => (
                                                <div key={problem.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex justify-between items-center hover:border-slate-700 transition-colors">
                                                    <div>
                                                        <div className="font-medium text-slate-300">{problem.title}</div>
                                                        <div className="text-xs text-slate-500">{problem.id.slice(0, 8)}...</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddProblem(problem)}
                                                        className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white p-2 rounded-lg transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {filteredAvailableProblems.length > 20 && (
                                                <div className="text-center text-xs text-slate-500 py-2">
                                                    And {filteredAvailableProblems.length - 20} more...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsManaging(false)}
                                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProblems}
                                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ContestDetails;
