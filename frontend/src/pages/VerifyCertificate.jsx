import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Award, CheckCircle2, Calendar, BookOpen, Clock, Loader2, Target, TrendingUp, User } from 'lucide-react';

const VerifyCertificate = () => {
    const { certCode } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await api.get(`/certificates/verify/${certCode}`);
                setData(response.data);
            } catch (err) {
                setError("Certificate not found or invalid.");
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [certCode]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center">
            <div className="max-w-md bg-white p-12 rounded-[2.5rem] shadow-xl border border-red-50">
                <ShieldCheck className="h-20 w-20 text-red-500 mx-auto mb-6 opacity-20" />
                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Verification Failed</h1>
                <p className="text-gray-500 mb-10 leading-relaxed font-medium">This certificate ID is either invalid or does not exist in our secure database.</p>
                <Link to="/" className="btn-primary w-full inline-block">Back to Platform</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafbfc] py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Brand Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                            <Award size={20} />
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">SmartLearning</span>
                    </div>
                    <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
                </div>

                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                    {/* Left: Profile & Badge */}
                    <div className="md:w-1/3 bg-gray-900 p-12 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -mr-16 -mt-16 blur-3xl opacity-20"></div>
                        <div className="h-32 w-32 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/10 shadow-inner">
                            <User size={64} className="text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">{data.student_name}</h2>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-green-500/20">
                            <CheckCircle2 size={12} /> Verified Learner
                        </div>
                        
                        <div className="mt-12 space-y-6 w-full">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Score Achievement</div>
                                <div className="text-2xl font-black text-white">{data.score}%</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Completion Date</div>
                                <div className="text-sm font-black text-white">{new Date(data.issued_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Certificate Details */}
                    <div className="flex-1 p-12 md:p-16">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Credential Details</h1>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Digital Verification Record</p>
                            </div>
                            <div className="bg-blue-50 text-blue-600 p-4 rounded-[2rem] border border-blue-100 flex flex-col items-center">
                                <ShieldCheck size={32} />
                                <span className="text-[10px] font-black mt-2 uppercase tracking-tighter">Verified</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <DetailItem icon={<BookOpen />} label="Program Name" value={data.course_name} />
                                <DetailItem icon={<Clock />} label="Estimated Effort" value={data.duration || "Self-paced"} />
                                <DetailItem icon={<Award />} label="Certification ID" value={data.certificate_id} />
                            </div>
                            <div className="space-y-8">
                                <DetailItem icon={<Target />} label="Curriculum Units" value={`${data.total_lessons} Lessons Completed`} />
                                <DetailItem icon={<TrendingUp />} label="Verification Status" value="Publicly Authenticated" color="text-green-600" />
                                <DetailItem icon={<Calendar />} label="Authentication Provider" value="SmartLearning Platform" />
                            </div>
                        </div>

                        <div className="mt-16 p-8 bg-blue-50 rounded-3xl border border-blue-100/50">
                            <div className="text-sm text-blue-900 font-bold leading-relaxed italic">
                                "This document confirms that the individual named above has demonstrated proficiency in the curriculum requirements through supervised assessments and project milestones."
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-100 text-blue-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                                    SmartLearning Verified Record
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-center mt-12">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} SmartLearning Platform &bull; Secure Digital Credentials
                    </p>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value, color = "text-gray-900" }) => (
    <div className="flex gap-4">
        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 border border-gray-100/50 shadow-sm">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{label}</div>
            <div className={`text-lg font-black tracking-tight leading-tight ${color}`}>{value}</div>
        </div>
    </div>
);

export default VerifyCertificate;
