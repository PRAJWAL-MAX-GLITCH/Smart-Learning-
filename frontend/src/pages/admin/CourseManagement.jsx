import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import courseService from '../../services/courseService';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle, Loader2, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', category: '', youtube_url: '', duration: '', total_lessons: '', difficulty_level: 'Beginner' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await courseService.getAllCourses(1, 50);
            setCourses(data.items);
        } catch (err) {
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({ 
                title: course.title, 
                description: course.description, 
                category: course.category, 
                youtube_url: course.youtube_url || '',
                duration: course.duration || '',
                total_lessons: course.total_lessons || '',
                difficulty_level: course.difficulty_level || 'Beginner'
            });
        } else {
            setEditingCourse(null);
            setFormData({ title: '', description: '', category: '', youtube_url: '', duration: '', total_lessons: '', difficulty_level: 'Beginner' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.youtube_url) {
            const ytRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
            if (!ytRegex.test(formData.youtube_url)) {
                toast.error("Please enter a valid YouTube URL");
                return;
            }
        }
        
        setIsSubmitting(true);
        try {
            if (editingCourse) {
                await courseService.updateCourse(editingCourse.id, formData);
                toast.success("Course updated successfully");
            } else {
                await courseService.createCourse(formData);
                toast.success("Course created successfully");
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the course!")) return;
        try {
            await courseService.deleteCourse(id);
            toast.success("Course deleted");
            fetchCourses();
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Curriculum Management</h1>
                    <p className="text-gray-500">Add, edit, or remove courses from the platform.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Course</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">Title</th>
                            <th className="px-6 py-5">Category</th>
                            <th className="px-6 py-5">Created At</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-20 text-gray-400"><Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600" /></td></tr>
                        ) : courses.map(course => (
                            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-gray-900">{course.title}</div>
                                    <div className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xs">{course.description}</div>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                        {course.category}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-sm text-gray-500">{new Date(course.created_at).toLocaleDateString()}</td>
                                <td className="px-8 py-6 text-right space-x-1">
                                    <Link
                                        to={`/admin/courses/${course.id}/lessons`}
                                        className="p-2 text-gray-400 hover:text-green-600 inline-block transition-colors"
                                        title="Manage Lessons"
                                    >
                                        <List className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to={`/admin/courses/${course.id}/questions`}
                                        className="p-2 text-gray-400 hover:text-blue-600 inline-block transition-colors"
                                        title="Manage Questions"
                                    >
                                        <BookOpen className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleOpenModal(course)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">{editingCourse ? 'Update Course' : 'Create New Course'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                                <input
                                    type="text" required className="input-field" value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <input
                                    type="text" required className="input-field" value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g. Physics, Coding, Mathematics"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows="4" className="input-field" value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Course Video Link (YouTube)</label>
                                <input
                                    type="url" className="input-field" value={formData.youtube_url}
                                    onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Duration</label>
                                    <input
                                        type="text" className="input-field !py-2" value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="4.5 Hours"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Lessons</label>
                                    <input
                                        type="number" className="input-field !py-2" value={formData.total_lessons}
                                        onChange={e => setFormData({ ...formData, total_lessons: e.target.value })}
                                        placeholder="12"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Difficulty</label>
                                    <select 
                                        className="input-field !py-2 appearance-none" 
                                        value={formData.difficulty_level}
                                        onChange={e => setFormData({ ...formData, difficulty_level: e.target.value })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : (editingCourse ? 'Save Changes' : 'Create Course')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default CourseManagement;
