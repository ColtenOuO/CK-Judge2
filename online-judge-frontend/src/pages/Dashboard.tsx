import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Code, Trophy, Users, Edit2, PlusCircle, Save, X } from 'lucide-react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    is_superuser: boolean;
    avatar_url?: string;
    signature?: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ avatar_url: '', signature: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await client.get('/users/me');
                setUser(res.data);
                setEditForm({
                    avatar_url: res.data.avatar_url || '',
                    signature: res.data.signature || ''
                });
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            const res = await client.patch(`/users/${user.id}`, editForm);
            setUser(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
                <div className="mb-10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                        CK
                    </div>
                    <span className="font-bold text-lg tracking-tight">Judge 2.0</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={<LayoutDashboard />} label="Overview" onClick={() => navigate('/dashboard')} active />
                    <SidebarItem icon={<Code />} label="Problem Set" onClick={() => navigate('/problems')} />
                    <SidebarItem icon={<Trophy />} label="Contests" />
                    <SidebarItem icon={<Users />} label="Rankings" />

                    {user?.is_superuser && (
                        <div className="pt-4 mt-4 border-t border-slate-800">
                            <div className="text-xs font-semibold text-slate-500 uppercase mb-2 px-3">Admin</div>
                            <button
                                onClick={() => navigate('/admin/create-problem')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-all"
                            >
                                <PlusCircle className="w-5 h-5" />
                                <span>Create Problem</span>
                            </button>
                        </div>
                    )}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full p-2 rounded-lg hover:bg-slate-800/50"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-slate-400">Welcome back, {user?.username || 'User'}.</p>
                    </div>
                </header>

                {/* Profile Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-8 mb-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 p-2 rounded-full backdrop-blur-sm transition-all border border-slate-700 hover:border-cyan-500/50"
                            title="Edit Profile"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        <div className="relative">
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-800 shadow-xl shadow-cyan-500/10"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-2xl bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-xl">
                                    <span className="text-4xl font-bold text-slate-600">{user?.username?.[0]?.toUpperCase()}</span>
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-cyan-400 text-xs font-bold px-2 py-1 rounded-full border border-slate-700">
                                {user?.is_superuser ? 'ADMIN' : 'MEMBER'}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-white mb-2">{user?.username}</h2>
                            <p className="text-slate-400 mb-6 flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {user?.email}
                            </p>

                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 inline-block min-w-[300px]">
                                <p className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Signature</p>
                                <p className="text-slate-300 italic">
                                    "{user?.signature || "A journey of a thousand miles begins with a single line of code."}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Problems Solved" value="0" />
                    <StatCard title="Active Contests" value="0" />
                    <StatCard title="Global Rank" value="-" />
                </div>

                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <h2 className="text-lg font-semibold mb-4 text-cyan-400">Recent Activity</h2>
                    <div className="text-slate-500 text-center py-10">
                        No recent submissions found.
                    </div>
                </div>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Avatar URL</label>
                                        <input
                                            type="text"
                                            value={editForm.avatar_url}
                                            onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Signature</label>
                                        <input
                                            type="text"
                                            value={editForm.signature}
                                            onChange={(e) => setEditForm({ ...editForm, signature: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                                            placeholder="Enter your personalized signature"
                                        />
                                    </div>
                                    <div className="pt-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, onClick, active = false }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span>{label}</span>
    </button>
);

const StatCard = ({ title, value }: { title: string, value: string }) => (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition-colors">
        <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
    </div>
);

export default Dashboard;
