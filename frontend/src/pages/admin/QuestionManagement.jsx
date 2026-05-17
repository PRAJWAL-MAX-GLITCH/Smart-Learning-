import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import quizService from '../../services/quizService';
import courseService from '../../services/courseService';
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, Save, X, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import BulkImportModal from '../../components/BulkImportModal';

const QuestionManagement = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState([]); // Array of selected IDs

    const [formData, setFormData] = useState({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        difficulty: 'medium',
        explanation: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, [courseId]);

    const fetchInitialData = async () => {
        try {
            const [courseData, quizData] = await Promise.all([
                courseService.getCourse(courseId),
                quizService.getQuizByCourse(courseId)
            ]);
            setCourse(courseData);
            setQuestions(quizData.questions || []);
            setSelectedQuestions([]); // Clear selections on fetch
        } catch (err) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectQuestion = (id) => {
        setSelectedQuestions(prev => 
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedQuestions.length === questions.length) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(questions.map(q => q.id));
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.length} selected question(s)?`)) return;
        
        try {
            // Delete sequentially or parallelly
            await Promise.all(selectedQuestions.map(id => quizService.deleteQuestion(id)));
            toast.success(`${selectedQuestions.length} questions removed successfully`);
            fetchInitialData();
        } catch (err) {
            console.error("Bulk delete error:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Error occurred while deleting some questions";
            toast.error(`Error: ${msg}`);
            fetchInitialData(); // Refresh to see what's left
        }
    };

    const handleOpenModal = (q = null) => {
        if (q) {
            setEditingQuestion(q);
            setFormData({
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer || 'A',
                difficulty: q.difficulty || 'medium',
                explanation: q.explanation || ''
            });
        } else {
            setEditingQuestion(null);
            setFormData({
                question_text: '',
                option_a: '',
                option_b: '',
                option_c: '',
                option_d: '',
                correct_answer: 'A',
                difficulty: 'medium',
                explanation: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure data is in the format backend expects
            const payload = { 
                ...formData, 
                course_id: parseInt(courseId),
                difficulty: formData.difficulty.toLowerCase()
            };

            if (editingQuestion) {
                await quizService.updateQuestion(editingQuestion.id, payload);
                toast.success("Question updated successfully");
            } else {
                await quizService.createQuestion(payload);
                toast.success("Question added successfully");
            }
            setIsModalOpen(false);
            fetchInitialData();
        } catch (err) {
            const msg = err.response?.data?.messages 
                ? Object.entries(err.response.data.messages).map(([k, v]) => `${k}: ${v}`).join(', ')
                : err.response?.data?.error || "Failed to save question";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await quizService.deleteQuestion(id);
            toast.success("Question removed");
            fetchInitialData();
        } catch (err) {
            console.error("Delete error:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || "Error deleting question";
            toast.error(msg);
        }
    };

    return (
        <AdminLayout>
            <div className="flex items-center space-x-4 mb-8">
                <Link to="/admin/courses" className="p-2 bg-white border rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Manage Questions</h1>
                    <p className="text-gray-500 font-medium">Course: {course?.title}</p>
                </div>
            </div>

            <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-700">{questions.length} Questions</h2>
                    {questions.length > 0 && (
                        <div className="flex items-center gap-2 border-l pl-4">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedQuestions.length === questions.length && questions.length > 0}
                                onChange={handleSelectAll}
                            />
                            <span className="text-sm font-medium text-gray-600">Select All</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    {selectedQuestions.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-100"
                        >
                            <Trash2 className="h-5 w-5" /> Delete Selected ({selectedQuestions.length})
                        </button>
                    )}
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-gray-100"
                    >
                        <UploadCloud className="h-5 w-5" /> Bulk Import
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
                    >
                        <Plus className="h-5 w-5" /> Add Question
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-gray-400 font-medium mb-4">No questions created yet for this course.</p>
                        <button onClick={() => handleOpenModal()} className="text-blue-600 font-bold hover:underline">Add your first question</button>
                    </div>
                ) : (
                    questions.map((q, idx) => (
                        <div key={q.id} className={`bg-white p-8 rounded-3xl border shadow-sm relative group transition-all ${selectedQuestions.includes(q.id) ? 'border-blue-400 ring-4 ring-blue-50' : 'border-gray-100'}`}>
                            <div className="absolute top-8 left-8">
                                <input 
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    checked={selectedQuestions.includes(q.id)}
                                    onChange={() => handleSelectQuestion(q.id)}
                                />
                            </div>
                            <div className="flex justify-between mb-4 pl-10">
                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Question {idx + 1} • {q.difficulty}</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleOpenModal(q)} className="p-1 text-gray-300 hover:text-indigo-600 transition-colors"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(q.id)} className="p-1 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 pl-10">{q.question_text}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 pl-10">
                                {[
                                    { key: 'A', val: q.option_a },
                                    { key: 'B', val: q.option_b },
                                    { key: 'C', val: q.option_c },
                                    { key: 'D', val: q.option_d }
                                ].map((opt) => (
                                    <div key={opt.key} className={`p-4 rounded-xl border text-sm flex items-center space-x-3 ${q.correct_answer === opt.key ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-50 text-gray-600'}`}>
                                        <span className="font-black opacity-50">{opt.key}</span>
                                        <span className="font-medium">{opt.val}</span>
                                    </div>
                                ))}
                            </div>
                            {q.explanation && (
                                <div className="p-4 bg-yellow-50 rounded-xl text-xs text-yellow-800 border border-yellow-100 leading-relaxed italic">
                                    <span className="font-black uppercase tracking-tighter mr-2">Explanation:</span> {q.explanation}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl my-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">{editingQuestion ? 'Update Question' : 'Add New Question'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
                                <textarea
                                    required rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all" 
                                    value={formData.question_text}
                                    onChange={e => setFormData({ ...formData, question_text: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold text-gray-500 mb-2">Option A</label><input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" value={formData.option_a} onChange={e => setFormData({ ...formData, option_a: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-2">Option B</label><input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" value={formData.option_b} onChange={e => setFormData({ ...formData, option_b: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-2">Option C</label><input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" value={formData.option_c} onChange={e => setFormData({ ...formData, option_c: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-2">Option D</label><input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" value={formData.option_d} onChange={e => setFormData({ ...formData, option_d: e.target.value })} /></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Correct Answer</label>
                                    <select className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" value={formData.correct_answer} onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}>
                                        <option value="A">Option A</option><option value="B">Option B</option><option value="C">Option C</option><option value="D">Option D</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Difficulty</label>
                                    <select className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Explanation (Optional)</label>
                                <textarea
                                    rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-200" 
                                    value={formData.explanation}
                                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
                                    <Save className="h-5 w-5" /> {editingQuestion ? 'Save Updates' : 'Publish Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Bulk Import Modal */}
            <BulkImportModal 
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                courseId={courseId}
                onComplete={fetchInitialData}
            />
        </AdminLayout>
    );
};

export default QuestionManagement;
