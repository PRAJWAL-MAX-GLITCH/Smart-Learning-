import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import quizService from '../services/quizService';
import courseService from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { formatDate, getScoreColor } from '../utils/helpers';
import { Target, TrendingUp, Calendar, ArrowRight, User as UserIcon, Sparkles, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPoints: 0, avgScore: 0, completed: 0 });

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [resultData, courseData] = await Promise.all([
                    quizService.getUserResults(),
                    courseService.getAllCourses(1, 10)
                ]);

                if (isMounted) {
                    setResults(resultData.results || []);
                    setCourses(courseData.items || []);
                    calculateStats(resultData.results || []);
                }
            } catch (err) {
                console.error("Dashboard fetch failed:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, []);

    const calculateStats = (data) => {
        if (data.length === 0) return;
        const avg = data.reduce((acc, r) => acc + r.score, 0) / data.length;
        setStats({
            totalPoints: data.length * 100,
            avgScore: Math.round(avg),
            completed: data.filter(r => r.score >= 80).length
        });
    };

    // Rule-based logic for recommendations
    const getRecommendations = () => {
        if (stats.avgScore === 0 && results.length === 0) {
            return {
                title: "Starting Your Journey?",
                text: "Begin with a foundational course to build your core engineering concepts.",
                filter: "Intro"
            };
        }
        if (stats.avgScore < 50) {
            return {
                title: "Build Your Foundations",
                text: "We noticed some challenges in your recent quizzes. Try these 'Beginner' tagged courses to strengthen your basics.",
                filter: "Basic"
            };
        }
        if (stats.avgScore < 80) {
            return {
                title: "Sharpen Your Skills",
                text: "You're doing great! These intermediate topics will help you bridge the gap to mastery.",
                filter: "Intermediate"
            };
        }
        return {
            title: "Path to Excellence",
            text: "Outstanding performance! You're ready for advanced specializations and research topics.",
            filter: "Advanced"
        };
    };

    const recommendation = getRecommendations();

    return (
        <Layout>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Welcome back, {user?.first_name || user?.username}!
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">
                        "The beautiful thing about learning is that no one can take it away from you."
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <Link to="/admin" className="bg-indigo-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors">
                        <TrendingUp size={18} /> Admin Panel
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    label="Current Mastery"
                    value={`${stats.avgScore}%`}
                    sub="Overall average score"
                    icon={<Target />}
                    variant="blue"
                />
                <StatCard
                    label="Certifications"
                    value={stats.completed}
                    sub="Target: 80% to pass"
                    icon={<TrendingUp />}
                    variant="white"
                />
                <StatCard
                    label="Total Progress"
                    value={stats.totalPoints}
                    sub="Experience points earned"
                    icon={<Calendar />}
                    variant="white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                {/* Main Content: Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h2 className="text-xl font-bold text-gray-900">Recent Quiz Activity</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/20 border-b">
                                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">Submission</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-20 text-gray-400 italic">Syncing with server...</td></tr>
                                    ) : results.length > 0 ? (
                                        results.slice(0, 5).map((r) => (
                                            <tr key={r.id} className="hover:bg-blue-50/20 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="text-sm font-bold text-gray-800">{formatDate(r.submitted_at)}</div>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest ${r.score >= 80 ? 'text-green-600' : 'text-blue-600'}`}>
                                                        {r.score >= 80 ? 'PASSED' : 'CERTIFIED'}
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-6 font-black text-2xl ${getScoreColor(r.score)}`}>
                                                    {r.score}%
                                                </td>
                                                <td className="px-6 py-6 text-gray-400 text-sm font-bold">
                                                    {r.time_taken ? `${Math.floor(r.time_taken / 60)}m ${r.time_taken % 60}s` : 'N/A'}
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <Link to={`/result/${r.id}`} className="p-2 text-gray-300 hover:text-blue-600 transition-colors inline-block">
                                                        <ArrowRight className="h-6 w-6" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center py-20 text-gray-400">No activity yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Recommendations */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl shadow-blue-100 flex flex-col h-full">
                        <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <Sparkles className="text-yellow-400 fill-yellow-400 h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-black mb-3">{recommendation.title}</h3>
                        <p className="text-blue-100/80 text-sm leading-relaxed mb-8 flex-grow">
                            {recommendation.text}
                        </p>

                        <div className="space-y-4">
                            <div className="text-xs font-black uppercase tracking-widest text-indigo-300">Recommended Courses</div>
                            {courses.slice(0, 2).map(c => (
                                <Link key={c.id} to={`/courses/${c.id}`} className="block group">
                                    <div className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-2xl transition-all">
                                        <div className="text-sm font-bold truncate">{c.title}</div>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-200">
                                            <BookOpen size={10} /> {c.category} • <Clock size={10} /> 4.5h
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link to="/" className="mt-10 bg-white text-blue-900 w-full py-4 rounded-2xl font-black text-center hover:bg-blue-50 transition-colors text-sm uppercase tracking-widest">
                            Explore More
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const StatCard = ({ label, value, sub, icon, variant }) => {
    const isBlue = variant === 'blue';
    return (
        <div className={`rounded-3xl p-8 ${isBlue
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
            : 'bg-white border border-gray-100 shadow-sm'
            }`}>
            <div className={`flex items-center space-x-2 mb-6 uppercase tracking-widest text-[10px] font-black ${isBlue ? 'text-blue-100' : 'text-gray-400'
                }`}>
                {React.cloneElement(icon, { className: "h-4 w-4" })}
                <span>{label}</span>
            </div>
            <div className="text-5xl font-black mb-2">{value}</div>
            <div className={`text-sm font-bold ${isBlue ? 'text-blue-100' : 'text-gray-400'}`}>{sub}</div>
        </div>
    );
};

export default Dashboard;
