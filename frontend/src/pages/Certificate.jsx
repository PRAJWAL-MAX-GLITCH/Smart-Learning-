import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Award, Download, Share2, CheckCircle2, ShieldCheck, Printer, Calendar, BookOpen, Clock, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

const Certificate = () => {
    const { courseId } = useParams();
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const response = await api.post(`/certificates/issue/${courseId}`);
                setCertData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load certificate");
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [courseId]);

    const downloadPDF = async () => {
        const toastId = toast.loading("Preparing your certificate... This may take a few seconds.");
        window.scrollTo(0, 0);
        
        try {
            const element = certificateRef.current;
            if (!element) throw new Error("Certificate element not found");

            // Give extra time for images to be fully painted
            await new Promise(resolve => setTimeout(resolve, 500));

            // High-Definition capture settings
            const canvas = await html2canvas(element, { 
                scale: 3, // Increased for HD quality
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight,
                onclone: (clonedDoc) => {
                    // 1. Hide non-essential elements
                    const junk = clonedDoc.querySelectorAll('nav, footer, .btn-primary, button');
                    junk.forEach(el => el.style.display = 'none');

                    // 2. Aggressive color override
                    const elements = clonedDoc.querySelectorAll('*');
                    elements.forEach(el => {
                        const style = window.getComputedStyle(el);
                        if (style.color.includes('okl') || style.color.includes('okb')) el.style.color = '#111827';
                        if (style.backgroundColor.includes('okl') || style.backgroundColor.includes('okb')) el.style.backgroundColor = '#ffffff';
                        if (style.borderColor.includes('okl') || style.borderColor.includes('okb')) el.style.borderColor = '#e5e7eb';
                        
                        // Force HEX for common classes
                        if (el.classList.contains('text-gray-900')) el.style.color = '#111827';
                        if (el.classList.contains('text-blue-600')) el.style.color = '#2563eb';
                        
                        // Ensure capture root is handled
                        if (el.classList.contains('min-w-\\[1000px\\]')) {
                            el.style.transform = 'none';
                            el.style.display = 'flex';
                            el.style.visibility = 'visible';
                            el.style.margin = '0';
                        }
                    });
                }
            });

            const imgData = canvas.toDataURL('image/png'); // PNG for lossless quality
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SmartLearning_Certificate_${certData.certificate_code}.pdf`);
            toast.success("HD Certificate downloaded!", { id: toastId });
        } catch (err) {
            console.error("PDF Export Error:", err);
            toast.error(`Export Failed: ${err.message || 'Please try again'}`, { id: toastId });
        }
    };

    const shareCredential = async () => {
        const shareData = {
            title: `Certificate of Completion - ${certData.course_name}`,
            text: `I just completed the ${certData.course_name} on SmartLearning! Check out my verified credential.`,
            url: verificationURL
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } else {
                await navigator.clipboard.writeText(verificationURL);
                toast.success("Verification link copied to clipboard!");
            }
        } catch (err) {
            console.error("Sharing failed:", err);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-white"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;

    if (error) return (
        <Layout>
            <div className="max-w-2xl mx-auto mt-20 p-10 bg-white rounded-3xl border border-red-100 text-center">
                <Award className="h-16 w-16 text-red-500 mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-black text-gray-900 mb-2">Certification Not Ready</h2>
                <p className="text-gray-500 mb-8">{error}</p>
                <Link to={`/courses/${courseId}`} className="btn-primary inline-flex items-center gap-2">
                    Back to Course
                </Link>
            </div>
        </Layout>
    );

    const verificationURL = `${window.location.origin}/verify/${certData.certificate_code}`;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Achievement</h1>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Official SmartLearning Certification</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => window.print()} className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={downloadPDF} className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            <Download size={18} /> Download PDF
                        </button>
                        <button onClick={shareCredential} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                            <Share2 size={18} /> Share Credential
                        </button>
                    </div>
                </div>

                {/* THE PREMIUM CERTIFICATE */}
                <div className="bg-gray-100 p-8 md:p-12 rounded-[3rem] shadow-inner overflow-x-auto">
                    <div 
                        ref={certificateRef}
                        style={{ 
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)', 
                            backgroundColor: '#ffffff',
                            color: '#111827', // BASE COLOR FIX
                            minWidth: '1000px',
                            aspectRatio: '1.414 / 1',
                            position: 'relative',
                            overflow: 'hidden',
                            padding: '64px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' 
                        }}
                    >
                        {/* Elegant Border */}
                        <div className="absolute inset-0 border-[20px] border-double m-4 pointer-events-none" style={{ borderColor: 'rgba(17, 24, 39, 0.05)' }}></div>
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl" style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)' }}></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full -ml-32 -mb-32 blur-3xl" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}></div>

                        {/* Top Section */}
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#111827', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                    <Award size={24} />
                                </div>
                                <div>
                                    <div className="text-xl font-black tracking-tighter" style={{ color: '#111827' }}>SmartLearning</div>
                                    <div className="text-[8px] font-black uppercase tracking-[0.3em] -mt-1" style={{ color: '#2563eb' }}>Official Excellence</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#9ca3af' }}>Certificate ID</div>
                                <div className="text-sm font-black font-mono tracking-tighter px-3 py-1 rounded-lg border" style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#f3f4f6' }}>
                                    {certData.certificate_code}
                                </div>
                            </div>
                        </div>

                        {/* Middle Content */}
                        <div className="text-center py-10 relative z-10">
                            <div className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 border" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', borderColor: 'rgba(234, 179, 8, 0.2)' }}>
                                Certificate of Completion
                            </div>
                            <h2 className="font-medium text-lg mb-8 tracking-wide" style={{ color: '#9ca3af' }}>This is to certify that</h2>
                            <h1 className="text-6xl font-black mb-8 tracking-tighter capitalize underline underline-offset-[12px]" style={{ color: '#111827', textDecorationColor: 'rgba(37, 99, 235, 0.2)' }}>
                                {certData.student_name || "Valuable Student"}
                            </h1>
                            <p className="max-w-2xl mx-auto leading-relaxed text-lg" style={{ color: '#6b7280' }}>
                                has successfully completed the professional course requirements for
                            </p>
                            <h3 className="text-3xl font-black mt-4 tracking-tight" style={{ color: '#111827' }}>
                                {certData.course_name}
                            </h3>
                            <div className="flex justify-center gap-10 mt-10 text-sm font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}>
                                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                                    <span>Score: {certData.score}%</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}>
                                    <Calendar size={16} style={{ color: '#3b82f6' }} />
                                    <span>Issued: {new Date(certData.issued_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex justify-between items-end relative z-10">
                            {/* QR Section */}
                            <div className="flex items-center gap-6">
                                <div className="bg-white p-2 rounded-2xl border" style={{ borderColor: '#f3f4f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                    <QRCodeCanvas 
                                        value={verificationURL} 
                                        size={512} 
                                        level="H" 
                                        includeMargin={true} 
                                        style={{ width: '120px', height: '120px' }} 
                                    />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-1" style={{ color: '#111827' }}>
                                        <ShieldCheck size={14} style={{ color: '#10b981' }} /> Scan to Verify
                                    </div>
                                    <p className="text-[8px] font-bold leading-tight max-w-[120px]" style={{ color: '#9ca3af' }}>
                                        This credential is secure and verifiable via SmartLearning platform.
                                    </p>
                                </div>
                            </div>

                            {/* Signature Section */}
                            <div className="text-center">
                                <div className="relative mb-2">
                                    <div className="absolute inset-x-0 bottom-4 h-px bg-gray-900/10"></div>
                                    <img 
                                        src="/signature.png" 
                                        alt="Founder Signature" 
                                        crossOrigin="anonymous"
                                        className="h-16 object-contain mix-blend-multiply"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <div className="font-serif italic text-2xl" style={{ color: '#9ca3af' }}>
                                        Prajwal Patil
                                    </div>
                                </div>
                                <div className="text-sm font-black" style={{ color: '#111827' }}>Prajwal Patil</div>
                                <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Founder & Platform Creator</div>
                            </div>
                        </div>

                        {/* Ribbon Accent */}
                        <div className="absolute top-0 left-20 w-16 h-32 bg-blue-600/10 rounded-b-3xl -z-10"></div>
                        <div className="absolute top-0 left-24 w-8 h-24 bg-blue-600/10 rounded-b-3xl -z-10"></div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <div className="font-black text-gray-900">Verified Credential</div>
                            <div className="text-sm text-gray-500 mt-1 leading-relaxed">This certificate is blockchain-ready and publicly verifiable.</div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="font-black text-gray-900">Secure Content</div>
                            <div className="text-sm text-gray-500 mt-1 leading-relaxed">Tamper-proof digital seal protected by SmartLearning.</div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                            <Download size={20} />
                        </div>
                        <div>
                            <div className="font-black text-gray-900">High Res Export</div>
                            <div className="text-sm text-gray-500 mt-1 leading-relaxed">Optimized for high-quality printing on A4 paper.</div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Certificate;
