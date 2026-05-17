import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Search, Mail, Calendar, MoreVertical, Shield, UserCheck } from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            // Re-using stats logic to get user list if available, 
            // or we'll need a new endpoint. For now, let's assume getStudents exists.
            const data = await adminService.getStudents();
            setStudents(data);
        } catch (err) {
            console.error("Failed to fetch students", err);
            // Fallback empty array
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Student Management</h1>
                    <p className="text-gray-500 font-medium">Monitor student progress and manage platform access.</p>
                </div>
                <div className="bg-emerald-50 px-6 py-4 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                    <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Active</div>
                        <div className="text-xl font-black text-emerald-600">{students.length} Students</div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search students by name or email..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100">
                    Export List
                </button>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-bold italic">Loading student database...</td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg shadow-sm border border-blue-100">
                                                    {student.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900">{student.username}</div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                                                        <Mail size={12} /> {student.email || 'no-email@smart.com'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                                <Calendar size={14} className="text-gray-300" />
                                                {new Date(student.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-100">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-gray-300 hover:text-gray-900 hover:bg-white rounded-xl shadow-sm transition-all">
                                                <MoreVertical size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-bold italic">No students found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default StudentManagement;
