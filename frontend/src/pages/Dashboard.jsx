import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import analyticsService from '../services/analyticsService';
import aiService from '../services/aiService';
import mlService from '../services/mlService';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import { 
    Target, TrendingUp, Calendar, ArrowRight, Sparkles, BookOpen, Clock, 
    PlayCircle, Award, CheckCircle2, BarChart3, Activity, List, ChevronRight, 
    Zap, Flame, History, Bell, RefreshCw, BrainCircuit, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);
    const [recommendationsData, setRecommendationsData] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPrediction, setLoadingPrediction] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                const [statsData, insights, recs] = await Promise.all([
                    analyticsService.getDashboardStats(),
                    aiService.getWeakTopics(),
                    analyticsService.getRecommendations().catch(() => null)
                ]);
                if (isMounted) {
                    setData(statsData);
                    setAiInsights(insights);
                    setRecommendationsData(recs || { recommendations: [], insight_message: "Keep learning! Here are some suggestions for you." });
                }
            } catch (err) {
                console.error("Dashboard analytics failed:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setLoadingRecs(false);
                }
            }
        };
        fetchStats();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        let isMounted = true;
        const fetchPrediction = async () => {
            try {
                setLoadingPrediction(true);
                const pred = await mlService.getPrediction(user.id);
                if (isMounted) {
                    setPredictionData(pred);
                }
            } catch (err) {
                console.error("Failed to fetch ML prediction:", err);
            } finally {
                if (isMounted) {
                    setLoadingPrediction(false);
                }
            }
        };
        fetchPrediction();
        return () => { isMounted = false; };
    }, [user?.id]);

    const handleRefreshRecs = async () => {
        setLoadingRecs(true);
        try {
            const recs = await analyticsService.getRecommendations();
            setRecommendationsData(recs || { recommendations: [], insight_message: "Keep learning! Here are some suggestions for you." });
        } catch (err) {
            console.error("Failed to refresh recommendations", err);
            setRecommendationsData({ recommendations: [], insight_message: "Keep learning! Here are some suggestions for you." });
        } finally {
            setLoadingRecs(false);
        }
    };

    // 1. Advanced Smart Greeting Logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning";
        if (hour >= 12 && hour < 17) return "Good Afternoon";
        if (hour >= 17 && hour < 21) return "Good Evening";
        return "Good Night"; // Late night (21:00 - 05:00)
    };

    // 2. Humanized Time Formatter (e.g., "2 hours ago")
    const formatTimeAgo = (dateString) => {
        // Ensure string is treated as UTC if it doesn't already have timezone info
        const normalizedDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const date = new Date(normalizedDate);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) return (
        <Layout>
            <div className="space-y-10 animate-pulse p-4">
                <div className="h-12 bg-gray-100 rounded-2xl w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-[2rem]"></div>)}
                </div>
            </div>
        </Layout>
    );

    const stats = data?.stats || { enrolled: 0, completed: 0, lessons_done: 0, avg_score: 0, streak: 0 };
    const weeklyData = Array.isArray(data?.weekly_activity) ? data.weekly_activity : [];
    const continueLearning = Array.isArray(data?.continue_learning) ? data.continue_learning : [];
    const activities = Array.isArray(data?.activities) ? data.activities : [];

    return (
        <Layout>
            {/* Humanized Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            Student Dashboard
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Overview</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        {getGreeting()}, {user?.first_name || user?.username} 👋
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Ready to continue your learning journey today?</p>
                </div>
                
                {/* Learning Streak Badge */}
                <div className="flex items-center gap-4">
                    <div className="bg-orange-50 px-6 py-4 rounded-[2rem] border border-orange-100 flex items-center gap-4 shadow-sm group hover:shadow-orange-200/50 transition-all cursor-default">
                        <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                            <Flame className="h-6 w-6 text-white fill-white" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Current Streak</div>
                            <div className="text-2xl font-black text-orange-600">{stats.streak} Days</div>
                        </div>
                    </div>
                    <button className="p-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:bg-gray-50 transition-colors relative">
                        <Bell className="h-6 w-6 text-gray-400" />
                        <span className="absolute top-4 right-4 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>

            {/* Premium Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard label="Active Courses" value={stats.enrolled} icon={<BookOpen />} color="blue" />
                <MetricCard label="Total Lessons" value={stats.lessons_done} icon={<Zap />} color="indigo" />
                <MetricCard label="Certificates" value={stats.completed} icon={<Award />} color="green" />
                
                {/* Consistency Score Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-8">
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                            <Target className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Consistency Score</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-4xl font-black text-white">{Math.min(100, stats.streak * 10 + 20)}%</div>
                        <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Excellent</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Continue Learning - Focused Grid */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Continue Learning</h2>
                            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                                Browse All
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {continueLearning.length > 0 ? continueLearning.map(course => (
                                <CourseCard 
                                    key={course.course_id}
                                    course={course}
                                    title={course.course_title}
                                    category={course.category}
                                    progress={course.progress}
                                    difficulty="Intermediate"
                                />
                            )) : (
                                <div className="col-span-full py-16 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                        <BookOpen className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-bold">No courses in progress. Start your first lesson!</p>
                                    <Link to="/" className="mt-4 text-blue-600 font-black uppercase text-xs tracking-widest">Explore Catalog</Link>
                                </div>
                            )}
                        </div>
                    </section>
                    
                    {/* Recommended For You - AI Adaptive Learning */}
                    {recommendationsData && (
                        <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[3rem] p-10 border border-blue-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                <Sparkles className="h-48 w-48 text-blue-600" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                        <Sparkles className="text-blue-600 h-6 w-6" /> Recommended For You
                                    </h2>
                                    <button 
                                        onClick={handleRefreshRecs}
                                        disabled={loadingRecs}
                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-white px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <RefreshCw className={`h-3 w-3 ${loadingRecs ? 'animate-spin' : ''}`} /> 
                                        Recalculate
                                    </button>
                                </div>
                                <p className="text-sm font-bold text-gray-500 mb-8 max-w-lg leading-relaxed">
                                    {recommendationsData?.insight_message || "Based on your recent performance, here are some courses tailored for you."}
                                </p>

                                {loadingRecs ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                                        {[1, 2].map(i => <div key={i} className="h-48 bg-white/50 rounded-[2.5rem]"></div>)}
                                    </div>
                                ) : recommendationsData?.recommendations?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {recommendationsData.recommendations.map(rec => (
                                            <CourseCard 
                                                key={rec.course_id}
                                                course={rec}
                                                title={rec.title}
                                                category={rec.topic}
                                                difficulty={rec.difficulty}
                                                isRecommended={true}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <CourseCard 
                                            title="Explore New Courses"
                                            category="General"
                                            difficulty="Beginner"
                                            thumbnail="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop"
                                        />
                                        <CourseCard 
                                            title="Continue Learning"
                                            category="General"
                                            difficulty="Intermediate"
                                            thumbnail="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                    
                    {/* Your Certifications - Showcase Achievements */}
                    {data?.certifications && data.certifications.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Certifications</h2>
                                <Award className="text-yellow-500 h-6 w-6" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.certifications.map(cert => (
                                    <div key={cert.course_id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all">
                                                <Award className="text-gray-400 group-hover:text-white" size={24} />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Achieved</div>
                                                <div className="text-2xl font-black text-blue-600 tabular-nums">{cert.score}%</div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-6 flex-1">{cert.course_title}</h3>
                                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issued {new Date(cert.completed_at).toLocaleDateString()}</span>
                                            <Link 
                                                to={`/certificate/${cert.course_id}`}
                                                className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                                            >
                                                View & Download <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Analytics Section */}
                    <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10">
                            <TrendingUp className="text-gray-50 h-32 w-32 group-hover:text-blue-50/50 transition-colors" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Learning Momentum</h2>
                                    <p className="text-sm text-gray-400 font-bold mt-1">Consistency over the last 7 days</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Activity</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 bg-indigo-200 rounded-full"></span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Target</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                                            dy={15} 
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc'}} 
                                            contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px'}}
                                            labelStyle={{fontWeight: 900, marginBottom: '4px', fontSize: '12px'}}
                                        />
                                        <Bar dataKey="lessons" fill="#2563eb" radius={[6, 6, 6, 6]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar - Activity & Showcase */}
                <div className="lg:col-span-4 space-y-10">
                    
                    {/* AI Prediction Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 bg-indigo-50 h-24 w-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6">
                                <BrainCircuit className="text-indigo-600 h-5 w-5" /> AI Quiz Prediction
                            </h3>
                            
                            {loadingPrediction ? (
                                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                                    <RefreshCw className="animate-spin text-indigo-600 h-6 w-6" />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Calculating Prediction...</p>
                                </div>
                            ) : predictionData && predictionData.prediction ? (
                                <div className={`p-6 rounded-2xl border transition-all ${
                                    predictionData.prediction === 'Pass' 
                                        ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200' 
                                        : 'bg-red-50/50 border-red-100 hover:border-red-200'
                                }`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${
                                            predictionData.prediction === 'Pass' 
                                                ? 'bg-emerald-100 text-emerald-600' 
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {predictionData.prediction === 'Pass' 
                                                ? <CheckCircle2 size={20} /> 
                                                : <AlertTriangle size={20} />
                                            }
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 leading-snug">
                                                {predictionData.prediction === 'Pass' 
                                                    ? '✅ You are likely to pass the next quiz' 
                                                    : '⚠️ You may struggle in the next quiz'
                                                }
                                            </div>
                                            <div className="text-[11px] font-bold text-gray-500 mt-2">
                                                Confidence: {(predictionData.confidence * 100).toFixed(0)}%
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 font-medium italic">
                                                {predictionData.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                                    <AlertTriangle className="mx-auto text-gray-400 h-8 w-8 mb-2" />
                                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                        Prediction not available
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                        Complete a few quizzes first so our AI model can evaluate your learning history!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Insights - Rule Based Detection */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 bg-blue-50 h-24 w-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Sparkles className="text-blue-600 h-5 w-5" /> AI Learning Insights
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                {aiInsights.length > 0 ? aiInsights.map((insight, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{insight.topic}</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                                insight.level === 'Weak' ? 'bg-red-100 text-red-600' : 
                                                insight.level === 'Strong' ? 'bg-emerald-100 text-emerald-600' : 
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                                {insight.level}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${
                                                        insight.level === 'Weak' ? 'bg-red-500' : 
                                                        insight.level === 'Strong' ? 'bg-emerald-500' : 
                                                        'bg-amber-500'
                                                    }`}
                                                    style={{ width: `${insight.accuracy}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500">{insight.accuracy}%</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-6 text-center">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Complete more quizzes to see insights</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <Activity className="text-blue-600 h-5 w-5" /> Activity Feed
                            </h3>
                        </div>
                        <div className="space-y-8 relative">
                            {/* Connector Line */}
                            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-50"></div>
                            
                            {activities.map((act, idx) => (
                                <div key={idx} className="relative flex gap-5 group">
                                    <div className="relative z-10 h-10 w-10 bg-white border-2 border-gray-50 rounded-xl flex items-center justify-center group-hover:border-blue-200 transition-colors">
                                        {act.type === 'lesson' ? <PlayCircle size={18} className="text-blue-600" /> : <TrendingUp size={18} className="text-emerald-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-sm font-black text-gray-900 leading-none">{act.title}</div>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase">{formatTimeAgo(act.timestamp)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{act.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-colors">
                            View All Activity
                        </button>
                    </div>

                    {/* Pro Badge Callout */}
                    <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                        <Sparkles className="absolute -right-5 -top-5 h-24 w-24 text-white/5" />
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black mb-4">Master Your Skills</h4>
                            <p className="text-blue-100/70 text-sm font-medium leading-relaxed mb-8">
                                Complete your current course paths and earn industry-recognized credentials.
                            </p>
                            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                <div className="h-12 w-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
                                    <Award className="h-6 w-6 text-indigo-900" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Earned This Month</div>
                                    <div className="text-lg font-black">{stats.completed} Certificates</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const MetricCard = ({ label, value, icon, color }) => {
    const colors = {
        blue: "bg-blue-600 text-white shadow-blue-200",
        indigo: "bg-indigo-900 text-white shadow-indigo-100",
        green: "bg-emerald-600 text-white shadow-emerald-100",
        orange: "bg-orange-500 text-white shadow-orange-100"
    };
    
    return (
        <div className={`${colors[color]} rounded-[2rem] p-8 shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl duration-300 group`}>
            <div className="flex items-center justify-between mb-8">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:bg-white group-hover:text-gray-900 transition-all">
                    {React.cloneElement(icon, { className: "h-5 w-5" })}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</div>
            </div>
            <div className="text-4xl font-black">{value}</div>
        </div>
    );
};

export default Dashboard;
