import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import quizService from '../services/quizService';
import { CheckCircle2, ChevronRight, HelpCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Quiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Timer state
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await quizService.getQuizByCourse(id);
                if (!data.questions || data.questions.length === 0) {
                    setError('No questions found for this course.');
                } else {
                    setQuizData(data);
                    startTimer();
                }
            } catch (err) {
                setError('Failed to load quiz questions.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();

        return () => stopTimer();
    }, [id]);

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = (questionId, optionKey) => {
        setAnswers({ ...answers, [questionId]: optionKey });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quizData.questions.length) {
            toast.error('Please answer all questions first.');
            return;
        }

        stopTimer();
        setSubmitting(true);
        const submitToast = toast.loading("Analyzing your performance...");

        try {
            const response = await quizService.submitQuiz(id, answers, seconds);
            toast.success("Results generated!", { id: submitToast });
            navigate(`/result/${response.result.id}`, { state: { result: response.result } });
        } catch (err) {
            toast.error('Failed to submit quiz.', { id: submitToast });
            startTimer(); // Restart timer if failed
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Layout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;
    if (error) return <Layout><div className="max-w-2xl mx-auto mt-20 text-center"><h2 className="text-xl text-red-600 font-bold mb-4">{error}</h2><button onClick={() => navigate(-1)} className="btn-primary w-auto inline-block px-6">Go Back</button></div></Layout>;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">{quizData.course_title}</h2>
                            <div className="text-2xl font-black text-gray-900">Assessment in Progress</div>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl text-gray-600 font-black tabular-nums">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(seconds)}</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-blue-600 h-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Progress: {Math.round(progress)}%</span>
                        <span>Question {currentQuestionIndex + 1} / {quizData.questions.length}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                    <div className="flex items-start space-x-5 mb-10">
                        <div className="bg-blue-600 rounded-2xl p-3 shadow-lg shadow-blue-100">
                            <HelpCircle className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 leading-[1.2]">
                            {currentQuestion.question_text}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { key: 'A', val: currentQuestion.option_a },
                            { key: 'B', val: currentQuestion.option_b },
                            { key: 'C', val: currentQuestion.option_c },
                            { key: 'D', val: currentQuestion.option_d }
                        ].map(({ key, val }) => (
                            <button
                                key={key}
                                onClick={() => handleSelectOption(currentQuestion.id, key)}
                                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-200 group ${answers[currentQuestion.id] === key
                                    ? 'border-blue-600 bg-blue-50/50 shadow-md translate-x-1'
                                    : 'border-gray-50 bg-gray-50/30 hover:border-blue-100 hover:bg-white hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center space-x-5">
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${answers[currentQuestion.id] === key ? 'bg-blue-600 text-white' : 'bg-white border text-gray-400 group-hover:border-blue-200 group-hover:text-blue-500'
                                        }`}>
                                        {key}
                                    </span>
                                    <span className={`text-xl font-bold transition-colors ${answers[currentQuestion.id] === key ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {val}
                                    </span>
                                </div>
                                {answers[currentQuestion.id] === key && (
                                    <div className="bg-blue-600 rounded-full p-1">
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-16 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="px-8 py-4 text-gray-400 font-bold hover:text-gray-900 disabled:opacity-0 transition-all"
                        >
                            Back
                        </button>

                        <div className="flex gap-4">
                            {currentQuestionIndex < quizData.questions.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!answers[currentQuestion.id]}
                                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black flex items-center space-x-3 disabled:bg-gray-200 disabled:text-gray-400 shadow-lg shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                >
                                    <span>Next Move</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !answers[currentQuestion.id]}
                                    className="bg-indigo-900 text-white px-12 py-4 rounded-2xl font-black flex items-center space-x-3 disabled:bg-gray-200 disabled:text-gray-400 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-100 transition-all"
                                >
                                    <span>{submitting ? 'Finalizing...' : 'Submit Answers'}</span>
                                    <CheckCircle2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Quiz;
