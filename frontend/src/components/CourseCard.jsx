import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Book } from 'lucide-react';

const CourseCard = ({ course }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-6">
                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                    <Book className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{course.category || 'General'}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {course.description || 'Quickly master this subject with our AI-guided path.'}
                </p>
                <Link
                    to={`/courses/${course.id}`}
                    className="inline-flex items-center space-x-2 text-blue-600 font-semibold group"
                >
                    <span>View Course</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default CourseCard;
