import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import aiService from '../services/aiService';
import quizService from '../services/quizService';
import { ArrowLeft, CheckCircle, XCircle, BrainCircuit, Loader, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Utility to shuffle an array
const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const QuizView = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await aiService.getAiQuiz(courseId);
                if (data && data.questions && data.questions.length > 0) {
                    setQuestions(shuffleArray(data.questions));
                } else {
                    setError("No questions found. Please generate the quiz first.");
                }
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load quiz. Have you generated it yet?");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [courseId]);

    const handleOptionSelect = (optionKey) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionKey
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Removed strict validation so users can submit partial quizzes

        // We need to submit answers to backend, or calculate score locally first.
        // For security, it's better to submit to a specific backend endpoint.
        // But since we just want to save the result, we can map options to a simplified format
        // and call resultService.submitQuiz.
        
        const loadingToast = toast.loading("Submitting quiz...");
        try {
            // Reformat answers for the backend submitQuiz endpoint format
            const formattedAnswers = {};
            questions.forEach((q, index) => {
                formattedAnswers[q.id] = selectedAnswers[index] || "A"; // Fallback to avoid null
            });

            const response = await quizService.submitQuiz(courseId, formattedAnswers);
            
            setScore(response.result?.score || 0);
            setIsSubmitted(true);
            toast.success("Quiz submitted successfully!", { id: loadingToast });
            
            // Note: In a real prod environment we'd pull the detailed correct answers from the response
            // so the user can review them. We'll show basic score here.
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit quiz.", { id: loadingToast });
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader className="animate-spin text-indigo-600 h-12 w-12" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading AI Quiz...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto py-20 text-center">
                    <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 flex flex-col items-center">
                        <AlertTriangle className="h-16 w-16 mb-4" />
                        <h2 className="text-2xl font-black mb-2">Quiz Not Found</h2>
                        <p className="font-medium">{error}</p>
                        <Link to={`/course/${courseId}`} className="mt-8 bg-white px-6 py-3 rounded-2xl text-red-600 font-black text-sm uppercase tracking-widest shadow-sm hover:bg-red-600 hover:text-white transition-all">
                            Back to Course
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    // Result View
    if (isSubmitted) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto py-12">
                    <div className="bg-white rounded-[3rem] p-12 text-center border border-gray-100 shadow-2xl shadow-indigo-100/50">
                        <div className="h-24 w-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Quiz Completed!</h1>
                        <p className="text-gray-500 font-medium mb-12">Great job testing your knowledge.</p>
                        
                        <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 mb-12">
                            <div className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Your Score</div>
                            <div className="text-7xl font-black text-indigo-600">
                                {score}%
                            </div>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                            <Link to={`/course/${courseId}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                                Return to Course
                            </Link>
                            <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all">
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const difficultyColors = {
        easy: 'bg-green-100 text-green-600',
        medium: 'bg-yellow-100 text-yellow-600',
        hard: 'bg-red-100 text-red-600',
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <Link to={`/course/${courseId}`} className="inline-flex items-center space-x-1 text-gray-500 hover:text-indigo-600 mb-8 transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Exit Quiz</span>
                </Link>
                
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-3 rounded-2xl">
                            <BrainCircuit className="text-indigo-600 h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Generated Quiz</h1>
                    </div>
                    <div className="text-[12px] font-black bg-gray-100 text-gray-600 px-4 py-2 rounded-xl uppercase tracking-widest">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                        <div 
                            className="h-full bg-indigo-600 transition-all duration-500"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between mb-8 pt-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${difficultyColors[currentQuestion?.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                            {currentQuestion?.difficulty || 'Medium'}
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-8 leading-tight">
                        {currentQuestion?.question_text}
                    </h2>

                    <div className="space-y-4 mb-12">
                        {['A', 'B', 'C', 'D'].map((key) => {
                            const isSelected = selectedAnswers[currentQuestionIndex] === key;
                            const optionText = currentQuestion?.options[key];
                            if (!optionText) return null;
                            
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleOptionSelect(key)}
                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all group flex items-center gap-4
                                        ${isSelected 
                                            ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100/50' 
                                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-black transition-colors
                                        ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                                    `}>
                                        {key}
                                    </div>
                                    <span className={`font-bold text-lg ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                        {optionText}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-100 pt-8">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            Previous
                        </button>
                        
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 transition-all active:scale-95"
                            >
                                Next Question
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95"
                            >
                                Submit Quiz
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default QuizView;
