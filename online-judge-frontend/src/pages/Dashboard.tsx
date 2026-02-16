import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Code, Trophy, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
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
                    <SidebarItem icon={<LayoutDashboard />} label="Overview" active />
                    <SidebarItem icon={<Code />} label="Problem Set" />
                    <SidebarItem icon={<Trophy />} label="Contests" />
                    <SidebarItem icon={<Users />} label="Rankings" />
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
                        <p className="text-slate-400">Welcome back, User.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
                            U
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Problems Solved" value="0" />
                    <StatCard title="Active Contests" value="0" />
                    <StatCard title="Global Rank" value="-" />
                </div>

                <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <h2 className="text-lg font-semibold mb-4 text-cyan-400">Recent Activity</h2>
                    <div className="text-slate-500 text-center py-10">
                        No recent submissions found.
                    </div>
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
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
