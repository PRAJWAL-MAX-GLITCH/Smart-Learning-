import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import Layout from '../components/Layout';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import { BookOpen, Clock, Award, Star, ArrowLeft, CheckCircle, Lock, Play, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    const [isCourseCompleted, setIsCourseCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [courseData, lessonsData, progressData] = await Promise.all([
                    courseService.getCourse(id),
                    courseService.getLessons(id),
                    progressService.getProgress(id)
                ]);
                
                setCourse(courseData);
                setLessons(lessonsData);
                setCompletedLessonIds(progressData.completed_lesson_ids || []);
                setIsCourseCompleted(progressData.completed);

                // Set initial lesson (first one or first uncompleted one)
                if (lessonsData.length > 0) {
                    const firstUncompleted = lessonsData.find(l => !progressData.completed_lesson_ids?.includes(l.id));
                    setCurrentLesson(firstUncompleted || lessonsData[0]);
                }
            } catch (err) {
                setError('Could not load course details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleVideoEnd = async () => {
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
                toast.success("Whole course completed! Final Quiz Unlocked! 🚀");
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
                                    onEnd={handleVideoEnd}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <Lock className="h-12 w-12 mb-4 opacity-20" />
                                    <span className="font-bold text-lg">No Lessons Available</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                    {course.category || 'Engineering'}
                                </span>
                                <div className="flex items-center space-x-2 text-blue-600 font-black text-sm">
                                    <span>{progressPercent}% Complete</span>
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>
                            </div>
                            
                            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                                {currentLesson ? currentLesson.title : course.title}
                            </h1>
                            <p className="text-lg text-gray-500 mb-8 leading-relaxed font-medium">
                                {currentLesson ? currentLesson.description : course.description}
                            </p>
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
                            {lessons.map((lesson, index) => {
                                const isActive = currentLesson?.id === lesson.id;
                                const isCompleted = completedLessonIds.includes(lesson.id);
                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setCurrentLesson(lesson)}
                                        className={`w-full text-left p-4 rounded-2xl transition-all flex items-center group ${
                                            isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-colors ${
                                            isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-50'
                                        }`}>
                                            {isCompleted ? (
                                                <CheckCircle className={`h-4 w-4 ${isActive ? 'text-white' : 'text-green-600'}`} />
                                            ) : (
                                                <span className={`text-xs font-black ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`}>
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black truncate">{lesson.title}</div>
                                            <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {lesson.duration || '05:00'}
                                            </div>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-gray-50 border-t mt-auto">
                            {isCourseCompleted ? (
                                <Link
                                    to={`/quiz/${course.id}`}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-[1.5rem] flex items-center justify-center text-lg font-black py-4 shadow-xl shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Start Certification Quiz →
                                </Link>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-full bg-gray-200 text-gray-500 rounded-[1.5rem] flex items-center justify-center text-sm font-black py-4 cursor-not-allowed">
                                        <Lock className="h-4 w-4 mr-2" />
                                        Quiz Locked ({completedLessonIds.length}/{lessons.length})
                                    </div>
                                    <p className="text-[9px] text-gray-400 text-center uppercase tracking-widest font-black leading-relaxed">
                                        Complete all lessons to unlock the final quiz
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Re-using icon because List was not imported
const List = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);

export default CourseDetail;
