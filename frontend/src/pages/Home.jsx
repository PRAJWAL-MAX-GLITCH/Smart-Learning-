import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import courseService from '../services/courseService';
import { Search, GraduationCap } from 'lucide-react';
import { CardSkeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await courseService.getAllCourses(1, 50);
            setCourses(data.items || []);
        } catch (err) {
            setError('Failed to fetch courses. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="mb-16 text-center">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                    <GraduationCap size={14} />
                    <span>Future-Proof Your Skills</span>
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight sm:text-7xl">
                    Master Your Future <br /> with <span className="text-blue-600">SmartLearning</span>
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
                    The world's most advanced platform for technical certifications and conceptual mastery. Start your ascent today.
                </p>
            </div>

            <div className="max-w-2xl mx-auto mb-16 px-4">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses by title or subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white border-2 border-gray-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none shadow-xl shadow-gray-100/50 transition-all text-lg font-bold placeholder:text-gray-300"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Available Programs</h2>
                <div className="text-sm font-bold text-gray-400">{filteredCourses.length} Courses Found</div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : error ? (
                <div className="bg-red-50 border-2 border-red-100 text-red-600 p-8 rounded-[2.5rem] text-center max-w-md mx-auto">
                    <div className="font-black text-2xl mb-2">Sync Error</div>
                    <p className="text-sm opacity-80 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Retry</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
                    ) : (
                        <div className="col-span-full py-32 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <div className="text-gray-400 font-black text-3xl mb-4">No Matches Found</div>
                            <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium italic">We couldn't find any courses matching your search. Try different keywords or browse all programs.</p>
                            <button onClick={() => setSearchTerm("")} className="text-blue-600 font-black hover:underline underline-offset-4">Reset Search</button>
                        </div>
                    )}
                </div>
            )}

            {/* Platform Promotion for Admin */}
            <div className="mt-32 bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4">Want to contribute?</h3>
                    <p className="text-gray-400 max-w-xl mx-auto mb-10 font-medium">As an authorized contributor, you can design new curriculum and evaluate student performance in the admin panel.</p>
                    <Link to="/admin" className="inline-block bg-white text-gray-900 px-10 py-4 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                        Enter Instructor Mode
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
