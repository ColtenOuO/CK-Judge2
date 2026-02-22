import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ChevronLeft, Users, Shield, ShieldOff, Search, Plus, UploadCloud, X, Code, Globe } from 'lucide-react';

interface UserSnippet {
    id: string;
    username: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
    last_login_ip?: string | null;
}

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserSnippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bulkJson, setBulkJson] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await client.get('/users/?limit=1000');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleAdmin = async (userId: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'revoke' : 'grant'} admin privileges for this user?`)) {
            return;
        }

        try {
            await client.patch(`/users/${userId}`, {
                is_superuser: !currentStatus
            });
            setUsers(users.map(u => u.id === userId ? { ...u, is_superuser: !currentStatus } : u));
        } catch (err) {
            console.error("Failed to update user role", err);
            alert("Failed to update user role. You might not have permission.");
        }
    };

    const handleBulkUpload = async () => {
        try {
            const parsed = JSON.parse(bulkJson);
            if (!Array.isArray(parsed)) throw new Error("JSON must be an array of user objects.");
            setUploading(true);
            const res = await client.post('/users/bulk', parsed);
            alert(`Success! Created ${res.data.created_count} users.\n${res.data.errors.length > 0 ? "Errors: " + res.data.errors.join('\n') : ""}`);
            setIsModalOpen(false);
            setBulkJson('');
            fetchUsers(); // Refresh list
        } catch (err: any) {
            alert("Failed to parse or upload JSON: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && users.length === 0) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20 relative">
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            User Management
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Create Users
                    </button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">Username</th>
                                    <th className="p-4 font-bold">Email</th>
                                    <th className="p-4 font-bold">Role</th>
                                    <th className="p-4 font-bold">Last IP</th>
                                    <th className="p-4 font-bold text-right">Joined</th>
                                    <th className="p-4 font-bold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-slate-800/50 transition-colors group"
                                        >
                                            <td className="p-4 text-sm font-bold text-indigo-400">
                                                {user.username}
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {user.email}
                                            </td>
                                            <td className="p-4">
                                                {user.is_superuser ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                                        <Shield className="w-3.5 h-3.5" />
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20">
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm font-mono text-slate-400 flex items-center gap-2 mt-1">
                                                {user.last_login_ip ? (
                                                    <><Globe className="w-3.5 h-3.5 text-cyan-500" /> {user.last_login_ip}</>
                                                ) : (
                                                    <span className="text-slate-600">Never</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => handleToggleAdmin(user.id, user.is_superuser, e)}
                                                        className={`p-2 rounded-lg text-xs font-bold transition-all ${user.is_superuser
                                                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                                            }`}
                                                        title={user.is_superuser ? "Revoke Admin" : "Make Admin"}
                                                    >
                                                        {user.is_superuser ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/submissions?user_id=${user.id}`)}
                                                        className="p-2 rounded-lg text-xs font-bold transition-all bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                                                        title="View Submissions"
                                                    >
                                                        <Code className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Bulk Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                <UploadCloud className="w-5 h-5 text-cyan-400" />
                                Bulk Create Users
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                                <h3 className="font-bold text-blue-400 mb-2">Instructions</h3>
                                <p className="text-sm text-blue-300/80 mb-2">
                                    You can create multiple users at once by uploading a JSON array. Each user object must contain a <code>username</code>, <code>email</code>, and <code>password</code>.
                                </p>
                                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-emerald-400">
                                    [<br />
                                    &nbsp;&nbsp;{'{'} "username": "student1", "email": "s1@example.com", "password": "pass" {'}'},<br />
                                    &nbsp;&nbsp;{'{'} "username": "student2", "email": "s2@example.com", "password": "pass" {'}'}<br />
                                    ]
                                </div>
                            </div>

                            <label className="block text-sm font-medium text-slate-400 mb-2">JSON Payload</label>
                            <textarea
                                value={bulkJson}
                                onChange={(e) => setBulkJson(e.target.value)}
                                placeholder="Paste your JSON array here..."
                                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 resize-none"
                            />
                        </div>

                        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkUpload}
                                disabled={uploading || !bulkJson.trim()}
                                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                            >
                                {uploading ? "Processing..." : "Create Users"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
