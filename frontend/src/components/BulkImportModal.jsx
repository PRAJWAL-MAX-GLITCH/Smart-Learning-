import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2, Trash2, Edit3, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const BulkImportModal = ({ isOpen, onClose, courseId, onComplete }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        const allowedExts = ['.csv', '.xlsx', '.docx', '.pdf'];
        const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
        
        if (!allowedExts.includes(ext)) {
            toast.error("Unsupported file format. Please upload CSV, Excel, Word or PDF.");
            return;
        }
        setFile(selectedFile);
        uploadForPreview(selectedFile);
    };

    const uploadForPreview = async (selectedFile) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('course_id', courseId);

        try {
            const response = await api.post('/admin/bulk-quiz/preview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreviewData(response.data);
            toast.success("File parsed successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to parse file");
            setFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleBulkSave = async () => {
        if (!previewData || previewData.questions.length === 0) return;
        
        setIsSaving(true);
        try {
            await api.post('/admin/bulk-quiz/save', {
                course_id: courseId,
                questions: previewData.questions
            });
            toast.success("All questions saved successfully!");
            onComplete();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save questions");
        } finally {
            setIsSaving(false);
        }
    };

    const removeQuestion = (index) => {
        const updated = { ...previewData };
        updated.questions.splice(index, 1);
        setPreviewData(updated);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bulk Import Questions</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Upload CSV, Excel, Word or PDF files</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100">
                        <X className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {!previewData ? (
                        /* Upload Area */
                        <div 
                            className={`h-80 border-4 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4 ${
                                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-4 text-blue-600">
                                    <Loader2 className="h-12 w-12 animate-spin" />
                                    <span className="font-black animate-pulse">Parsing file...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-gray-200/50">
                                        <Upload className="h-12 w-12 text-blue-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black text-gray-900">Drag & Drop your file here</p>
                                        <p className="text-gray-400 font-medium">or click to browse from computer</p>
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="mt-2 bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg"
                                    >
                                        Select File
                                    </button>
                                    <input 
                                        type="file" 
                                        hidden 
                                        ref={fileInputRef} 
                                        onChange={(e) => handleFile(e.target.files[0])}
                                        accept=".csv,.xlsx,.docx,.pdf"
                                    />
                                </>
                            )}
                        </div>
                    ) : (
                        /* Preview Table */
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                        <FileText className="text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900">{file?.name}</div>
                                        <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                            {previewData.questions.length} Questions Detected
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setPreviewData(null)}
                                    className="text-xs font-black text-red-500 hover:underline uppercase tracking-widest"
                                >
                                    Change File
                                </button>
                            </div>

                            <div className="border border-gray-100 rounded-3xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Question</th>
                                            <th className="px-6 py-4 text-center">Correct</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {previewData.questions.map((q, idx) => (
                                            <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${!q.is_valid ? 'bg-red-50/30' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {q.is_valid ? (
                                                        <CheckCircle2 size={18} className="text-green-500" />
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-red-500" title={q.error_msg}>
                                                            <AlertCircle size={18} />
                                                            <span className="text-[10px] font-black uppercase tracking-tighter">Error</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 max-w-md">
                                                    <div className="text-sm font-bold text-gray-900 line-clamp-2">{q.question_text}</div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[9px] font-black bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{q.difficulty}</span>
                                                        <span className="text-[9px] font-black bg-blue-50 px-2 py-0.5 rounded text-blue-500 uppercase">{q.marks} Marks</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-black mx-auto border border-green-100">
                                                        {q.correct_answer}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => removeQuestion(idx)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl font-black text-sm text-gray-500 hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleBulkSave}
                        disabled={!previewData || isSaving || previewData.questions.length === 0}
                        className={`px-10 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl ${
                            !previewData || isSaving || previewData.questions.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving Questions...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Confirm & Save {previewData?.questions.length || 0} Questions
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
