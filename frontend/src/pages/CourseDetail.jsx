import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import { BookOpen, Clock, Award, Star, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [courseData, progressData] = await Promise.all([
                    courseService.getCourse(id),
                    progressService.getProgress(id)
                ]);
                setCourse(courseData);
                setIsCompleted(progressData.completed);
            } catch (err) {
                setError('Could not load course details.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleMarkComplete = async () => {
        setCompleting(true);
        try {
            await progressService.markAsCompleted(id);
            setIsCompleted(true);
            toast.success("Course marked as completed! Quiz unlocked. 🚀");
        } catch (err) {
            toast.error("Failed to update progress.");
        } finally {
            setCompleting(false);
        }
    };

    if (loading) return (
        <Layout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>
    );

    if (error || !course) return (
        <Layout><div className="bg-red-50 text-red-600 p-4 rounded-md text-center">{error || 'Course not found'}</div></Layout>
    );

    const getEmbedUrl = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
          ? `https://www.youtube.com/embed/${match[2]}`
          : url;
    };

    return (
        <Layout>
            <Link to="/" className="inline-flex items-center space-x-1 text-gray-500 hover:text-blue-600 mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Courses</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden">
                        {course.youtube_url ? (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 shadow-inner bg-black">
                                <iframe 
                                    className="w-full h-full"
                                    src={getEmbedUrl(course.youtube_url)} 
                                    title="Educational Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 shadow-inner bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                <Lock className="h-12 w-12 mb-4 opacity-20" />
                                <span className="font-bold text-lg">Video not available</span>
                            </div>
                        )}

                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                            {course.category || 'Engineering'}
                        </span>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{course.title}</h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            {course.description || 'This comprehensive course covers all fundamental aspects of the subject, providing you with deep insights and practical knowledge.'}
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Foundational Concepts', 'Expert Techniques', 'Real-world Applications', 'Best Practices'].map((item, i) => (
                                <div key={i} className="flex items-center space-x-3 text-gray-700 p-3 bg-gray-50 rounded-xl">
                                    <div className="bg-blue-100 rounded-full p-1"><Star className="h-4 w-4 text-blue-600" /></div>
                                    <span className="font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900">Your Progress</h3>
                            {isCompleted ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">Completed</span>
                            ) : (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">In Progress</span>
                            )}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center text-gray-500"><Clock className="h-4 w-4 mr-2" /> Duration</span>
                                <span className="font-bold">4.5 Hours</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center text-gray-500"><BookOpen className="h-4 w-4 mr-2" /> Lessons</span>
                                <span className="font-bold">12 Sections</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center text-gray-500"><Award className="h-4 w-4 mr-2" /> Level</span>
                                <span className="font-bold">Intermediate</span>
                            </div>
                        </div>

                        {isCompleted ? (
                            <Link
                                to={`/quiz/${course.id}`}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center text-lg font-black py-4 shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Start Certification Quiz
                            </Link>
                        ) : (
                            <button
                                onClick={handleMarkComplete}
                                disabled={completing}
                                className="w-full bg-indigo-900 hover:bg-black text-white rounded-2xl flex items-center justify-center text-lg font-black py-4 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                            >
                                {completing ? "Updating..." : "Mark as Completed"}
                                {!completing && <CheckCircle className="ml-2 h-5 w-5" />}
                            </button>
                        )}

                        {!isCompleted && (
                            <div className="mt-4 flex items-center justify-center space-x-2 text-gray-400">
                                <Lock className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Complete course to unlock quiz</span>
                            </div>
                        )}
                        
                        <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-black leading-relaxed">
                            Requires 80% score<br/>for official certification
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CourseDetail;
