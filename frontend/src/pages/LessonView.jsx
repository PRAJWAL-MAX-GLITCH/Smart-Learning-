import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { PlayCircle, CheckCircle, ChevronRight, BookOpen, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState([]); // Array of completed lesson IDs

    useEffect(() => {
        fetchLessonData();
    }, [courseId, lessonId]);

    const fetchLessonData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            // In a real app, these would be in services
            const [courseRes, progressRes] = await Promise.all([
                axios.get(`http://127.0.0.1:5000/api/courses/${courseId}`, { headers }),
                axios.get(`http://127.0.0.1:5000/api/progress/${courseId}`, { headers })
            ]);

            setCourse(courseRes.data);
            const lesson = courseRes.data.lessons.find(l => l.id === parseInt(lessonId)) || courseRes.data.lessons[0];
            setCurrentLesson(lesson);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load lesson content");
            setLoading(false);
        }
    };

    const handleLessonComplete = async () => {
        // API call to mark lesson as completed
        toast.success("Lesson completed! Moving to next...");
        const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < course.lessons.length - 1) {
            const nextLesson = course.lessons[currentIndex + 1];
            navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
        } else {
            toast.success("Course finished! Take the quiz.");
            navigate(`/quiz/${courseId}`);
        }
    };

    if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div></Layout>;

    return (
        <Layout>
            <div className="flex flex-col lg:flex-row min-h-[calc(100-rem)] gap-8">
                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="mb-6">
                        <Link to={`/courses/${courseId}`} className="text-gray-500 flex items-center gap-2 hover:text-blue-600 mb-4 transition-colors">
                            <ArrowLeft size={18} /> Back to Course Overview
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900">{currentLesson?.title}</h1>
                    </div>

                    <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl mb-8 border-4 border-white">
                        {currentLesson?.youtube_url && (
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${currentLesson.youtube_url.includes('v=') ? currentLesson.youtube_url.split('v=')[1] : currentLesson.youtube_url.split('/').pop()}`}
                                title="Lesson Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">About this lesson</h2>
                            <button 
                                onClick={handleLessonComplete}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95"
                            >
                                Complete & Next <ChevronRight size={20} />
                            </button>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {currentLesson?.description || "In this lesson, we will dive deep into the core concepts of this topic. Make sure to take notes for your final assessment."}
                        </p>
                    </div>
                </div>

                {/* Sidebar Playlist */}
                <div className="w-full lg:w-96">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden sticky top-8">
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                                <BookOpen className="text-blue-600" /> Course Playlist
                            </h3>
                            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">{course?.lessons?.length} Lessons</p>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {course?.lessons?.map((lesson, idx) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                                    className={`w-full p-5 flex items-center gap-4 transition-all border-b border-gray-50 last:border-0 ${currentLesson?.id === lesson.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}`}
                                >
                                    <span className="text-xs font-black text-gray-300 w-4">{idx + 1}</span>
                                    <div className="flex-1 text-left">
                                        <h4 className={`text-sm font-bold ${currentLesson?.id === lesson.id ? 'text-blue-700' : 'text-gray-700'}`}>{lesson.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">12:00 mins</p>
                                    </div>
                                    {idx === 0 ? <CheckCircle className="text-green-500" size={18} /> : <PlayCircle className="text-gray-200" size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[2rem] p-6 text-white shadow-lg">
                        <h4 className="font-black mb-2 flex items-center gap-2 tracking-tighter uppercase"><FileText size={18} /> Quick Notes</h4>
                        <textarea 
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 min-h-[150px]"
                            placeholder="Write something important here..."
                        ></textarea>
                        <button className="w-full mt-4 bg-white text-indigo-900 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors">Save Notes</button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LessonView;
