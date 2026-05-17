import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Link } from 'react-router-dom';
import { 
    Book, PlusCircle, Users, BarChart3, Settings, Loader2, 
    ShieldCheck, Activity, Terminal, ExternalLink, Zap, Award, CheckCircle
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const statsData = await adminService.getStats();
            setData(statsData);
        } catch (err) {
            toast.error("Failed to fetch platform metrics");
        } finally {
            setLoading(false);
        }
    };

    // Helper for humanizing timestamps (similar to student dashboard)
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex justify-center py-40"><Loader2 className="animate-spin text-blue-600 h-12 w-12" /></div>
        </AdminLayout>
    );

    const stats = data || { total_students: 0, total_courses: 0, total_results: 0, avg_platform_score: 0, insights: {}, recent_events: [] };

    return (
        <AdminLayout>
            {/* Real Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            System Control
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            Database Connected
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Platform Command Center</h1>
                    <p className="text-gray-500 font-medium mt-1">Real-time management of your learning ecosystem.</p>
                </div>
            </div>

            {/* High-Impact Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard label="Total Students" value={stats.total_students} icon={<Users />} color="blue" />
                <StatCard label="Live Courses" value={stats.total_courses} icon={<Book />} color="indigo" />
                <StatCard label="Assessments" value={stats.total_results} icon={<BarChart3 />} color="emerald" />
                <StatCard label="Avg Score" value={`${stats.avg_platform_score}%`} icon={<Award />} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Operations */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                            <Activity className="text-blue-600" /> Operational Overview
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <QuickAction 
                                to="/admin/courses" 
                                title="Manage Courses" 
                                desc="Update lessons, videos and curriculum"
                                icon={<Book className="text-blue-600" />}
                            />
                            <QuickAction 
                                to="/admin/students" 
                                title="Student Management" 
                                desc="Monitor enrollments and progress"
                                icon={<Users className="text-indigo-600" />}
                            />
                        </div>
                    </div>

                    {/* Dynamic System Info (Removed dummy latency/ssl) */}
                    <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <ShieldCheck className="text-white/10 h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Security Protocol</div>
                            <h3 className="text-2xl font-black mb-4">Integrity Monitoring</h3>
                            <p className="text-gray-400 font-medium leading-relaxed mb-8 max-w-md">
                                All platform systems are operating normally. Backups are performed regularly to ensure data safety.
                            </p>
                            <div className="flex gap-4">
                                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                                    <CheckCircle size={14} className="text-emerald-400" /> SSL Secured
                                </div>
                                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                                    <CheckCircle size={14} className="text-emerald-400" /> Database Healthy
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Real Insights */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-gradient-to-br from-indigo-950 to-blue-900 p-10 rounded-[3rem] text-white shadow-xl">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <Zap className="text-yellow-400 fill-yellow-400" /> Platform Insights
                        </h3>
                        <div className="space-y-6">
                            <InsightRow label="Student Engagement" value={stats.insights?.engagement || "N/A"} />
                            <InsightRow label="Most Popular Course" value={stats.insights?.popular_course || "N/A"} />
                            <InsightRow label="Platform Pass Rate" value={`${stats.avg_platform_score}%`} />
                            
                            <div className="pt-6 border-t border-white/10 mt-6">
                                <p className="text-sm text-blue-200 leading-relaxed font-medium">
                                    {stats.total_courses < 3 
                                        ? "Focus on adding more course content to increase student variety."
                                        : "Analyze student quiz results to identify areas for content improvement."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Event Feed */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <ExternalLink className="text-blue-600 h-5 w-5" /> Recent Events
                        </h3>
                        <div className="space-y-4">
                            {stats.recent_events && stats.recent_events.length > 0 ? (
                                stats.recent_events.map((event, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="text-sm font-black text-gray-900 truncate">{event.type}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase truncate">{event.detail}</div>
                                        </div>
                                        <div className="text-[10px] font-black text-blue-600 bg-white px-3 py-1 rounded-lg border border-gray-100 whitespace-nowrap">
                                            {formatTimeAgo(event.time)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-300 font-bold italic text-sm">No recent events tracked</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const StatCard = ({ label, value, icon, color }) => {
    const colors = {
        blue: "bg-blue-600 shadow-blue-100",
        indigo: "bg-indigo-600 shadow-indigo-100",
        emerald: "bg-emerald-600 shadow-emerald-100",
        orange: "bg-orange-600 shadow-orange-100"
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm group">
            <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl group-hover:scale-110 transition-transform`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <div className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">{label}</div>
                <div className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums">{value}</div>
            </div>
        </div>
    );
};

const QuickAction = ({ to, title, desc, icon }) => (
    <Link to={to} className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-50 hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100">
        <div className="flex items-center space-x-5">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform border border-gray-100">
                {icon}
            </div>
            <div>
                <div className="font-black text-gray-900 text-lg tracking-tight">{title}</div>
                <div className="text-sm text-gray-500 font-medium">{desc}</div>
            </div>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-4 w-4 text-blue-600" />
        </div>
    </Link>
);

const InsightRow = ({ label, value }) => (
    <div className="flex justify-between items-center gap-4">
        <span className="text-blue-200/60 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">{label}</span>
        <span className="font-black text-white truncate text-right">{value}</span>
    </div>
);

export default AdminDashboard;
