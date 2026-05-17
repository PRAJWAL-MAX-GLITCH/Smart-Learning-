import React from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Trophy, RefreshCw, LayoutDashboard, CheckCircle2, XCircle, Award, Loader2 } from 'lucide-react';
import quizService from '../services/quizService';

const Result = () => {
    const { id } = useParams();
    const location = useLocation();
    const [result, setResult] = React.useState(location.state?.result || null);
    const [loading, setLoading] = React.useState(!result);

    React.useEffect(() => {
        if (!result && id) {
            const fetchResult = async () => {
                try {
                    const data = await quizService.getResult(id);
                    setResult(data);
                } catch (err) {
                    console.error("Failed to fetch result:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchResult();
        }
    }, [id, result]);

    if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div></Layout>;
    if (!result) return <Navigate to="/dashboard" />;

    const isSuccess = result.score >= 80;

    return (
        <Layout>
            <div className="max-w-2xl mx-auto py-10">
                <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center">
                    <div className="mb-8">
                        {isSuccess ? (
                            <div className="bg-yellow-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="h-14 w-14 text-yellow-500 fill-yellow-200" />
                            </div>
                        ) : (
                            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <RefreshCw className="h-12 w-12 text-gray-400" />
                            </div>
                        )}
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Quiz Completed!</h1>
                        <p className="text-gray-500 text-lg">Here's how much you've mastered today.</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-8 flex justify-around mb-8">
                        <div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Your Score</p>
                            <p className={`text-5xl font-black ${isSuccess ? 'text-green-600' : 'text-blue-600'}`}>
                                {result.score}%
                            </p>
                        </div>
                        <div className="border-l border-gray-200"></div>
                        <div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Questions</p>
                            <p className="text-5xl font-black text-gray-800">
                                {result.correct_answers}/{result.total_questions}
                            </p>
                        </div>
                    </div>

                    {(() => {
                        let tp = result.topic_performance;
                        if (typeof tp === 'string') {
                            try { tp = JSON.parse(tp); } catch (e) { tp = null; }
                        }
                        if (!tp || Object.keys(tp).length === 0) return null;

                        return (
                            <div className="text-left mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Topic Breakdown</h3>
                                <div className="space-y-3">
                                    {Object.entries(tp).map(([topic, stats]) => {
                                    const accuracy = Math.round((stats.correct / stats.total) * 100) || 0;
                                    let level = 'Weak';
                                    let color = 'text-red-600 bg-red-100 border-red-200';
                                    if (accuracy > 75) {
                                        level = 'Strong';
                                        color = 'text-green-600 bg-green-100 border-green-200';
                                    } else if (accuracy >= 50) {
                                        level = 'Average';
                                        color = 'text-blue-600 bg-blue-100 border-blue-200';
                                    }
                                    return (
                                        <div key={topic} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl gap-2">
                                            <div className="font-semibold text-gray-800">{topic}</div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-500">{stats.correct}/{stats.total} Correct ({accuracy}%)</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
                                                    {level}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        );
                    })()}

                    <div className={`p-6 rounded-2xl mb-10 flex items-center space-x-4 border ${isSuccess ? 'bg-green-50 border-green-100 text-green-800' : 'bg-blue-50 border-blue-100 text-blue-800'
                        }`}>
                        {isSuccess ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <RefreshCw className="h-8 w-8 text-blue-500" />}
                        <div className="text-left">
                            <h3 className="font-extrabold text-xl">Feedback: {result.feedback}</h3>
                            <p className="text-sm opacity-80">
                                {isSuccess
                                    ? "Outstanding job! You've successfully passed the certification."
                                    : "Good effort! Review the course material once more to improve your score."}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {isSuccess && (
                            <Link 
                                to={`/certificate/${result.course_id}`} 
                                className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200"
                            >
                                <Award className="h-5 w-5 text-yellow-400" />
                                <span>View Certificate</span>
                            </Link>
                        )}
                        <Link to="/dashboard" className="flex-1 btn-primary py-4 flex items-center justify-center gap-2">
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Go to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Result;
