import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, BookOpen, Clock, BarChart3, Sparkles, AlertCircle } from 'lucide-react';

const CourseCard = ({ 
    course, 
    title, 
    thumbnail, 
    category, 
    progress, 
    difficulty, 
    isRecommended,
    isWeak
}) => {
    // 1. Core Props Extraction (supports both direct props and nested course object)
    const cardId = course?.id || course?.course_id;
    const cardTitle = title || course?.title || course?.course_title || 'Course Title';
    const cardCategory = category || course?.category || 'General';
    const cardDifficulty = difficulty || course?.difficulty_level || course?.difficulty || 'Intermediate';
    
    // Resolve dynamic progress value (support 0 if explicitly provided, else fallback to nested course object)
    const resolvedProgress = typeof progress === 'number' ? progress : (typeof course?.progress === 'number' ? course.progress : null);
    
    // 2. Thumbnail Auto-Generation Logic
    let videoUrl = course?.youtube_url || course?.video_url || '';
    let cardThumbnail = thumbnail || course?.thumbnail_url;
    
    if (!cardThumbnail) {
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = videoUrl.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;
            cardThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop';
        } else {
            // Default premium placeholder image
            cardThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop';
        }
    }

    // 3. Progress Color Logic
    const getProgressColor = (val) => {
        if (val <= 30) return 'bg-red-500';
        if (val <= 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    // 4. AI Badges Calculation
    const showRecommended = isRecommended || course?.is_recommended;
    const showWeakTopic = isWeak || course?.is_weak;

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:scale-[1.03] transition-all duration-300 group flex flex-col h-full relative">
            
            {/* Top Thumbnail Image Section */}
            <div className="h-48 bg-gray-50 relative overflow-hidden">
                <img 
                    src={cardThumbnail} 
                    alt={cardTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop';
                    }}
                />
                
                {/* AI / Recommendation Overlays */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {showRecommended && (
                        <span className="px-3 py-1.5 bg-blue-600/90 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-400/30 flex items-center gap-1 backdrop-blur-sm shadow-md">
                            <Sparkles size={10} className="animate-spin duration-1000" /> Recommended
                        </span>
                    )}
                    {showWeakTopic && (
                        <span className="px-3 py-1.5 bg-red-600/90 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-400/30 flex items-center gap-1 backdrop-blur-sm shadow-md">
                            <AlertCircle size={10} /> Weak Topic
                        </span>
                    )}
                </div>

                {/* Dark Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <PlayCircle size={48} className="text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300" />
                </div>
            </div>

            {/* Course Information & Body */}
            <div className="p-8 flex-1 flex flex-col">
                
                {/* Category Badge & Difficulty Tag */}
                <div className="flex justify-between items-start mb-4 gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100/50">
                        {cardCategory}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                        cardDifficulty.toLowerCase().includes('begin') ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' :
                        cardDifficulty.toLowerCase().includes('adv') ? 'text-red-600 bg-red-50 border border-red-100' :
                        'text-amber-600 bg-amber-50 border border-amber-100'
                    }`}>
                        {cardDifficulty}
                    </span>
                </div>

                {/* Course Title */}
                <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-2 leading-tight">
                    {cardTitle}
                </h3>

                {/* Description Fallback */}
                {!resolvedProgress && (
                    <p className="text-gray-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed">
                        {course?.description || 'Accelerate your mastery of technical skill sets with personalized quiz insights, lesson paths, and verified certificates.'}
                    </p>
                )}

                {/* Progress Bar (renders only when started/progress exists) */}
                {resolvedProgress !== null && (
                    <div className="mb-6 mt-auto">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-blue-600">{resolvedProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(resolvedProgress)}`} 
                                style={{ width: `${resolvedProgress}%` }} 
                            />
                        </div>
                    </div>
                )}

                {/* Footer Action Button */}
                <div className="mt-auto">
                    <Link
                        to={`/courses/${cardId}`}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 group-hover:shadow-blue-200/50 transform group-hover:-translate-y-0.5 active:scale-95"
                    >
                        <span>{resolvedProgress > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                        <PlayCircle size={14} />
                    </Link>
                </div>

            </div>

        </div>
    );
};

export default CourseCard;
