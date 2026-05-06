import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Trophy, RefreshCw, LayoutDashboard, CheckCircle2, XCircle } from 'lucide-react';

const Result = () => {
    const location = useLocation();
    const result = location.state?.result;

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
                        <Link to="/dashboard" className="flex-1 btn-primary py-4 flex items-center justify-center gap-2">
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Go to Dashboard</span>
                        </Link>
                        <Link
                            to={`/courses/${result.course_id}`}
                            className="flex-1 border-2 border-gray-100 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Back to Course
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Result;
