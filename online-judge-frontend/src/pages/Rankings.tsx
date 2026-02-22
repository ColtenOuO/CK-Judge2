import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Star } from 'lucide-react';
import client from '../api/client';

interface RankingUser {
    id: string;
    username: string;
    avatar_url: string | null;
    solved_count: number;
}

const Rankings: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const res = await client.get('/users/rankings');
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch rankings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="absolute left-8 top-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block"
                    >
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-orange-400">
                            Global Rankings
                        </h1>
                        <p className="text-slate-400 text-lg">See who's leading the pack in coding supremacy.</p>
                    </motion.div>
                </header>

                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-sm font-semibold text-slate-400 uppercase tracking-wider w-24 text-center">Rank</th>
                                    <th className="px-8 py-5 text-sm font-semibold text-slate-400 uppercase tracking-wider">Coder</th>
                                    <th className="px-8 py-5 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Problems Solved</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {users.map((user, index) => {
                                    const rank = index + 1;
                                    let RankIcon = null;
                                    let rankColor = "text-slate-400";
                                    let rowBg = "hover:bg-slate-800/30";

                                    if (rank === 1) {
                                        RankIcon = <Medal className="w-6 h-6 text-yellow-400" />;
                                        rankColor = "text-yellow-400 font-bold text-xl";
                                        rowBg = "bg-yellow-500/5 hover:bg-yellow-500/10 border-l-2 border-yellow-400";
                                    } else if (rank === 2) {
                                        RankIcon = <Medal className="w-6 h-6 text-slate-300" />;
                                        rankColor = "text-slate-300 font-bold text-lg";
                                        rowBg = "bg-slate-700/10 hover:bg-slate-700/20";
                                    } else if (rank === 3) {
                                        RankIcon = <Medal className="w-6 h-6 text-amber-600" />;
                                        rankColor = "text-amber-600 font-bold text-lg";
                                        rowBg = "bg-amber-900/10 hover:bg-amber-900/20";
                                    } else {
                                        RankIcon = <span className="text-slate-500">#{rank}</span>;
                                    }

                                    return (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`${rowBg} transition-colors group relative`}
                                        >
                                            <td className="px-8 py-5 text-center">
                                                <div className={`flex justify-center items-center ${rankColor}`}>
                                                    {RankIcon}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url.startsWith('http') ? user.avatar_url : `${client.defaults.baseURL?.replace('/api/v1', '')}${user.avatar_url}`}
                                                            alt={user.username}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-lg group-hover:border-cyan-500 transition-colors"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg group-hover:border-cyan-500 transition-colors">
                                                            <span className="text-xl font-bold text-slate-500">{user.username.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-lg text-slate-200 group-hover:text-cyan-400 transition-colors">
                                                            {user.username}
                                                        </div>
                                                        {rank === 1 && <div className="text-xs text-yellow-500 flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Grandmaster</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                                                    <span className="text-2xl font-bold text-cyan-400">{user.solved_count}</span>
                                                    <span className="text-xs text-slate-500 uppercase tracking-widest">Solved</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-16 text-center text-slate-500">
                                            No rankings available yet. Be the first to solve a problem!
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

export default Rankings;
