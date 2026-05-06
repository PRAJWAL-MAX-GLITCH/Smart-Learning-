import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, Save, X, Video, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const LessonManagement = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtube_url: '',
        duration: 10,
        order_index: 0
    });

    useEffect(() => {
        fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://127.0.0.1:5000/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(res.data.lessons || []);
        } catch (err) {
            toast.error("Failed to load lessons");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (lesson = null) => {
        if (lesson) {
            setEditingLesson(lesson);
            setFormData({
                title: lesson.title,
                description: lesson.description,
                youtube_url: lesson.youtube_url,
                duration: lesson.duration,
                order_index: lesson.order_index
            });
        } else {
            setEditingLesson(null);
            setFormData({
                title: '',
                description: '',
                youtube_url: '',
                duration: 10,
                order_index: lessons.length
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingLesson) {
                await axios.put(`http://127.0.0.1:5000/api/admin/lessons/${editingLesson.id}`, formData, { headers });
                toast.success("Lesson updated");
            } else {
                await axios.post(`http://127.0.0.1:5000/api/admin/lessons`, { ...formData, course_id: parseInt(courseId) }, { headers });
                toast.success("Lesson added");
            }
            setIsModalOpen(false);
            fetchLessons();
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this lesson?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/api/admin/lessons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Lesson removed");
            fetchLessons();
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    return (
        <AdminLayout>
            <div className="flex items-center space-x-4 mb-8">
                <Link to="/admin/courses" className="p-2 bg-white border rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Manage Lessons</h1>
                    <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">Course Content Playlist</p>
                </div>
            </div>

            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-700">{lessons.length} Lessons</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
                >
                    <Plus className="h-5 w-5" /> Add Lesson
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
                ) : lessons.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-gray-400 font-medium">No lessons added yet.</p>
                    </div>
                ) : (
                    lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all">
                            <div className="text-gray-300 group-hover:text-blue-600 cursor-move"><GripVertical size={20} /></div>
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400">{idx + 1}</div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{lesson.title}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-400 flex items-center gap-1 font-bold uppercase tracking-widest"><Video size={14} /> Video</span>
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{lesson.duration} Mins</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(lesson)} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(lesson.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lesson Title</label>
                                <input 
                                    type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" 
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">YouTube URL</label>
                                <input 
                                    type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" 
                                    value={formData.youtube_url} onChange={e => setFormData({...formData, youtube_url: e.target.value})}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration (Mins)</label>
                                    <input 
                                        type="number" className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" 
                                        value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Order Index</label>
                                    <input 
                                        type="number" className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" 
                                        value={formData.order_index} onChange={e => setFormData({...formData, order_index: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Short Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200 min-h-[100px]" 
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                            <button 
                                type="submit" disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Lesson</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default LessonManagement;
