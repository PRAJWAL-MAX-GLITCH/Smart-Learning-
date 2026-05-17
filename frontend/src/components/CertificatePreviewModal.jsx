import React from 'react';
import { X, Award, ShieldCheck, Download, ExternalLink, QrCode } from 'lucide-react';

const CertificatePreviewModal = ({ isOpen, onClose, courseTitle, studentName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header Actions */}
                <div className="absolute top-8 right-8 z-10 flex gap-2">
                    <button 
                        onClick={onClose}
                        className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row h-full">
                    
                    {/* Sidebar / Info */}
                    <div className="lg:w-72 bg-gray-50 p-10 border-r border-gray-100 hidden lg:block">
                        <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-200">
                            <Award size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight leading-tight">Achievement Preview</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                            This is a visual preview of the industry-recognized certificate you'll earn upon completing this program.
                        </p>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                                    <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                    In Progress
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Requirements</div>
                                <div className="text-xs font-bold text-gray-400">Finish all lessons & pass final quiz with 70%+</div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-blue-100/50 rounded-[2rem] border border-blue-100">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">
                                Motivational Preview Only
                            </p>
                        </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="flex-1 p-6 sm:p-12 lg:p-16 overflow-y-auto max-h-[90vh]">
                        
                        {/* THE ACTUAL CERTIFICATE DESIGN */}
                        <div className="aspect-[1.414/1] w-full bg-white border-[12px] border-double border-gray-100 rounded-sm p-4 sm:p-12 relative overflow-hidden shadow-inner">
                            
                            {/* Watermark/Background Decor */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-25deg] pointer-events-none">
                                <Award size={500} />
                            </div>

                            {/* Border Accent */}
                            <div className="absolute inset-4 border border-gray-100 rounded-sm"></div>

                            <div className="relative z-10 flex flex-col h-full text-center">
                                {/* Logo */}
                                <div className="flex items-center justify-center gap-3 mb-10">
                                    <div className="bg-gray-900 p-1.5 rounded-lg">
                                        <ShieldCheck className="text-white h-5 w-5" />
                                    </div>
                                    <span className="text-xl font-black tracking-tighter text-gray-900">
                                        Smart<span className="text-blue-600">Learning</span>
                                    </span>
                                </div>

                                <div className="space-y-2 mb-10">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Certificate of Completion</h4>
                                    <div className="h-1 w-24 bg-gray-900 mx-auto rounded-full"></div>
                                </div>

                                <p className="text-sm text-gray-500 font-medium italic mb-2">This is to certify that</p>
                                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-8 font-serif underline underline-offset-8 decoration-1 decoration-gray-200">
                                    {studentName}
                                </h2>

                                <p className="text-sm text-gray-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                                    has successfully fulfilled all requirements and demonstrated mastery in the specialized program
                                </p>

                                <h3 className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight mb-12">
                                    {courseTitle}
                                </h3>

                                {/* Bottom Signatures & QR */}
                                <div className="mt-auto flex flex-col sm:flex-row items-center justify-between pt-12 gap-8 border-t border-gray-50">
                                    <div className="text-left">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Verification</div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <QrCode size={48} className="text-gray-300" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 mb-1">ID: SL-PREVIEW-XXXX</div>
                                                <div className="text-[10px] font-bold text-gray-400">Date: {new Date().toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="mb-2 h-12 w-32 ml-auto opacity-20">
                                            {/* Signature Placeholder */}
                                            <div className="border-b-2 border-gray-900 h-full w-full italic font-serif flex items-end justify-center pb-2 text-xl text-gray-400">Signature</div>
                                        </div>
                                        <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Founder & CEO</div>
                                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">SmartLearning Institute</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Footer */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button 
                                onClick={onClose}
                                className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200"
                            >
                                Continue Your Journey
                            </button>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Complete the course to download real PDF
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificatePreviewModal;
