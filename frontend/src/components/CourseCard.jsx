import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, BarChart, PlayCircle } from 'lucide-react';

const CourseCard = ({ course }) => {
    // Humanized metadata (believable defaults if missing)
    const lessonsCount = course.lessons_count || 12;
    const duration = course.duration || "1.5 Hours";
    const difficulty = course.difficulty || "Intermediate";

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all group flex flex-col h-full">
            {/* Header / Category */}
            <div className="p-8 pb-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {course.category || 'General'}
                        </span>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${course.is_new ? 'bg-green-500 animate-pulse' : 'hidden'}`}></div>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                    {course.title}
                </h3>
            </div>

            {/* Content */}
            <div className="px-8 flex-1">
                <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                    {course.description || 'Master the core concepts of this subject with our structured curriculum and AI-powered assessments.'}
                </p>

                {/* Real-world Metadata Chips */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {course.total_lessons && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 p-2 rounded-xl">
                            <BookOpen size={14} className="text-blue-600" />
                            {course.total_lessons} Lessons
                        </div>
                    )}
                    {course.duration && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 p-2 rounded-xl">
                            <Clock size={14} className="text-indigo-600" />
                            {course.duration}
                        </div>
                    )}
                    {course.difficulty_level && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 p-2 rounded-xl col-span-2">
                            <BarChart size={14} className="text-emerald-600" />
                            Level: {course.difficulty_level}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 pt-0 mt-auto">
                <Link
                    to={`/courses/${course.id}`}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 group-hover:shadow-blue-200"
                >
                    <span>Start Learning</span>
                    <PlayCircle size={18} className="transition-transform group-hover:scale-110" />
                </Link>
            </div>
        </div>
    );
};

export default CourseCard;
