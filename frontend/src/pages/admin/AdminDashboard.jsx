import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Link } from 'react-router-dom';
import { Book, PlusCircle, Users, BarChart3, Settings, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_students: 0,
        total_courses: 0,
        total_results: 0,
        avg_platform_score: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data);
        } catch (err) {
            toast.error("Failed to fetch platform metrics");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900">Admin Control Center</h1>
                <p className="text-gray-500">Real-time metrics for your learning platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {loading ? (
                    <div className="col-span-full flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : (
                    <>
                        <AdminStatCard label="Total Students" value={stats.total_students} icon={<Users />} color="bg-blue-600" />
                        <AdminStatCard label="Courses Active" value={stats.total_courses} icon={<Book />} color="bg-indigo-600" />
                        <AdminStatCard label="Quizzes Taken" value={stats.total_results} icon={<BarChart3 />} color="bg-green-600" />
                        <AdminStatCard label="Platform Score" value={`${stats.avg_platform_score}%`} icon={<Settings />} color="bg-orange-600" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Link
                            to="/admin/courses"
                            className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                                    <Book className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Manage Courses</div>
                                    <div className="text-sm text-gray-500">Create and edit course curriculum</div>
                                </div>
                            </div>
                            <PlusCircle className="h-5 w-5 text-gray-300 group-hover:text-blue-600" />
                        </Link>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                    <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                        <BarChart3 className="text-blue-300" size={24} />
                    </div>
                    <h2 className="text-2xl font-black mb-4 tracking-tighter">Content Intelligence</h2>
                    <p className="text-blue-100/70 mb-6 leading-relaxed font-medium italic">
                        {stats.total_results > 0
                            ? `Students have completed ${stats.total_results} assessments so far. The average score is ${stats.avg_platform_score}%, which is within your target range.`
                            : "No quiz data collected yet. Once students start taking assessments, overall platform trends will appear here."
                        }
                    </p>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="text-xs font-black uppercase tracking-widest text-blue-300 mb-2">Automated Suggestion:</div>
                        <div className="text-sm text-white font-bold">
                            {stats.total_courses < 5 ? "Expand your curriculum: Add at least 5 courses to improve student engagement." : "Curriculum is healthy. Focus on adding high-difficulty questions."}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const AdminStatCard = ({ label, value, icon, color }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">{label}</div>
        <div className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums">{value}</div>
    </div>
);

export default AdminDashboard;
