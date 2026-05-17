import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Activity, Terminal, Clock, User, ArrowRight, Shield, Zap, Search } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminActivityLogs = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await adminService.getStats();
            // Using the recent_events from our stats endpoint
            setActivities(data.recent_events || []);
        } catch (err) {
            console.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            System Monitoring
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Audit & Activity Logs</h1>
                    <p className="text-gray-500 font-medium mt-1">Comprehensive record of all platform interactions.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Terminal size={20} />
                    </div>
                    <div className="pr-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Status</div>
                        <div className="text-sm font-black text-emerald-600 flex items-center gap-1">
                            <Zap size={14} className="fill-emerald-600" /> Healthy
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search logs by student name or activity type..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                        All Events
                    </button>
                    <button className="px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                        Critical Only
                    </button>
                </div>
            </div>

            {/* Log Stream */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                <div className="space-y-2">
                    {loading ? (
                        <div className="text-center py-20 text-gray-300 font-bold italic animate-pulse">Syncing system logs...</div>
                    ) : activities.length > 0 ? (
                        activities.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-lg group-hover:shadow-blue-100 transition-all border border-transparent group-hover:border-blue-50">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                                log.type === 'New Enrollment' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {log.type}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">&bull; {formatTimeAgo(log.time)}</span>
                                        </div>
                                        <div className="text-lg font-black text-gray-900 tracking-tight">{log.detail}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 text-gray-300 font-bold italic">No activity logs recorded in the current session.</div>
                    )}
                </div>
            </div>

            {/* Security Callout */}
            <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <Shield className="absolute -right-10 -bottom-10 h-48 w-48 text-white/5" />
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-black mb-4">Security & Accountability</h3>
                    <p className="text-gray-400 font-medium leading-relaxed">
                        Activity logs are immutable and stored for audit purposes. Every student interaction, enrollment, and administrative action is timestamped and verified against the platform's security protocol.
                    </p>
                    <div className="mt-8 flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Last Sync</span>
                            <span className="text-sm font-bold">Just Now</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Active Nodes</span>
                            <span className="text-sm font-bold">Primary DB Instance</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminActivityLogs;
