import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import Layout from '../components/Layout';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, Award, Star, ArrowLeft, CheckCircle, Lock, Play, Shield, ChevronRight, Eye, List, BrainCircuit, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import CertificatePreviewModal from '../components/CertificatePreviewModal';
import aiService from '../services/aiService';

const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    const [isCourseCompleted, setIsCourseCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [courseData, progressData] = await Promise.all([
                    courseService.getCourse(id),
                    progressService.getProgress(id).catch(() => ({ completed: false, completed_lesson_ids: [] }))
                ]);
                
                setCourse(courseData);
                console.log("DEBUG: Course Data Received:", courseData);
                const validLessons = Array.isArray(courseData.lessons) ? courseData.lessons : [];
                console.log("DEBUG: Valid Lessons:", validLessons);
                setLessons(validLessons);
                toast.success(`Loaded ${validLessons.length} lessons!`);
                setCompletedLessonIds(progressData?.completed_lesson_ids || []);
                setIsCourseCompleted(progressData?.completed || false);

                // Set initial lesson (first one or first uncompleted one)
                if (validLessons.length > 0) {
                    const firstUncompleted = validLessons.find(l => !progressData?.completed_lesson_ids?.includes(l.id));
                    setCurrentLesson(firstUncompleted || validLessons[0]);
                }
            } catch (err) {
                const msg = err.response?.data?.message || err.response?.data?.error || 'Could not load course details.';
                setError(msg);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleMarkAsCompleted = async () => {
        if (!currentLesson) return;
        if (completedLessonIds.includes(currentLesson.id)) {
            // Already completed, move to next if exists
            moveToNextLesson();
            return;
        }
        
        try {
            await progressService.trackLessonProgress(id, currentLesson.id);
            const newCompletedIds = [...completedLessonIds, currentLesson.id];
            setCompletedLessonIds(newCompletedIds);
            
            toast.success(`Lesson "${currentLesson.title}" Completed!`, {
                icon: '✅',
                style: { borderRadius: '20px', background: '#000', color: '#fff' }
            });

            // Check if all lessons are now completed
            if (newCompletedIds.length === lessons.length) {
                await progressService.markAsCompleted(id);
                setIsCourseCompleted(true);
                toast.success("Whole course completed! Automatically launching Final Quiz... 🚀", {
                    icon: '🎓',
                    style: { borderRadius: '20px', background: '#10B981', color: '#fff' },
                    duration: 3000
                });
                
                // Automatically open/navigate to quiz after 2.5 seconds
                setTimeout(() => {
                    navigate(`/quiz/${id}`);
                }, 2500);
            } else {
                moveToNextLesson();
            }
        } catch (err) {
            console.error("Failed to update lesson progress", err);
        }
    };

    const moveToNextLesson = () => {
        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
            setCurrentLesson(lessons[currentIndex + 1]);
        }
    };

    const handleGenerateAIQuiz = async () => {
        if (!course?.id) return;
        setIsGeneratingQuiz(true);
        const loadingToast = toast.loading('AI is analyzing the video and generating a quiz...');
        try {
            await aiService.generateQuiz(course.id);
            toast.success('AI Quiz Generated Successfully! You can now test your knowledge.', { id: loadingToast });
        } catch (err) {
            console.error("AI Quiz generation failed", err);
            toast.error(err.response?.data?.error || 'Failed to generate AI Quiz', { id: loadingToast });
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    if (loading) return (
        <Layout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>
    );

    if (error || !course) return (
        <Layout><div className="bg-red-50 text-red-600 p-4 rounded-md text-center">{error || 'Course not found'}</div></Layout>
    );

    const getVideoId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const activeVideoId = currentLesson ? getVideoId(currentLesson.youtube_url) : null;
    const progressPercent = lessons.length > 0 ? Math.round((completedLessonIds.length / lessons.length) * 100) : 0;

    return (
        <Layout>
            <Link to="/" className="inline-flex items-center space-x-1 text-gray-500 hover:text-blue-600 mb-8 transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm">Back to Academy</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Video + Description) */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2.5rem] p-2 shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="aspect-video w-full rounded-[2rem] overflow-hidden shadow-inner bg-black relative group">
                            {activeVideoId ? (
                                <YouTube 
                                    key={currentLesson.id}
                                    videoId={activeVideoId}
                                    className="w-full h-full"
                                    containerClassName="w-full h-full"
                                    opts={{
                                        width: '100%',
                                        height: '100%',
                                        playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
                                    }}
                                    onEnd={() => toast.success("Lesson video finished! Click 'Mark as Completed' below to save progress.", {
                                        icon: '📺',
                                        style: { borderRadius: '20px', background: '#000', color: '#fff' }
                                    })}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <Lock className="h-12 w-12 mb-4 opacity-20" />
                                    <span className="font-bold text-lg">No Lessons Available</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-8">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                    {course.category || 'Engineering'}
                                </span>
                                {course.difficulty_level && (
                                    <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border border-gray-200">
                                        Difficulty: {course.difficulty_level}
                                    </span>
                                )}
                                {course.duration && (
                                    <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                                        Est. Time: {course.duration}
                                    </span>
                                )}
                                <div className="ml-auto flex items-center space-x-2 text-blue-600 font-black text-sm bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                                    <span>{progressPercent}% Mastered</span>
                                    <div className="w-24 h-2 bg-white rounded-full overflow-hidden border border-blue-200">
                                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                    {currentLesson ? currentLesson.title : course.title}
                                </h1>
                                {currentLesson && !completedLessonIds.includes(currentLesson.id) && (
                                    <button 
                                        onClick={handleMarkAsCompleted}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-green-100/50 hover:-translate-y-1 active:scale-95"
                                    >
                                        <CheckCircle size={18} /> Mark as Completed
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex gap-4 mb-6">
                                <button 
                                    onClick={handleGenerateAIQuiz}
                                    disabled={isGeneratingQuiz}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-100/50 hover:-translate-y-1 active:scale-95"
                                >
                                    {isGeneratingQuiz ? <Loader className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                                    {isGeneratingQuiz ? 'Generating AI Quiz...' : 'Generate AI Quiz'}
                                </button>
                                <Link 
                                    to={`/ai-quiz/${id}`}
                                    className="bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-100/20 hover:-translate-y-1 active:scale-95"
                                >
                                    Take AI Quiz
                                </Link>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                    {currentLesson ? currentLesson.description : course.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Playlist */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden sticky top-8 flex flex-col h-[calc(100vh-8rem)]">
                        <div className="p-8 border-b">
                            <h3 className="text-xl font-black text-gray-900 flex items-center">
                                <List className="h-5 w-5 mr-3 text-blue-600" />
                                Playlist
                            </h3>
                        </div>


                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {lessons.length === 0 ? (
                                <p className="text-center py-10 text-gray-400">No lessons found in array (Count: {lessons.length})</p>
                            ) : lessons.map((lesson, index) => (
                                <button
                                    key={lesson.id || index}
                                    onClick={() => setCurrentLesson(lesson)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center border ${
                                        currentLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                                >
                                    <span className="font-bold mr-3">{index + 1}.</span>
                                    <span className="font-bold">LESSON: {lesson.title || 'Untitled'}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-6 bg-gray-50 border-t mt-auto">
                            {isCourseCompleted ? (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowPreview(true)}
                                            className="flex-1 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 transition-all group"
                                        >
                                            <Eye size={18} /> Preview Cert
                                        </button>
                                        <Link
                                            to={`/quiz/${id}`}
                                            className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow-xl shadow-green-100 transition-all"
                                        >
                                            <Award size={18} /> Final Quiz
                                        </Link>
                                    </div>
                                    <p className="text-[10px] text-green-600 font-black text-center uppercase tracking-widest">
                                        All Lessons Mastered!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-full bg-gray-200 text-gray-500 rounded-2xl flex items-center justify-center text-sm font-black py-4 cursor-not-allowed">
                                        <Lock className="h-4 w-4 mr-2" />
                                        Quiz Locked ({completedLessonIds.length}/{lessons.length})
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-black leading-relaxed">
                                        Complete all lessons to unlock the final quiz
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificate Preview Modal */}
            <CertificatePreviewModal 
                isOpen={showPreview} 
                onClose={() => setShowPreview(false)} 
                courseTitle={course.title}
                studentName={`${user?.first_name || ''} ${user?.last_name || user?.username || 'Student'}`}
            />
        </Layout>
    );
};

export default CourseDetail;
