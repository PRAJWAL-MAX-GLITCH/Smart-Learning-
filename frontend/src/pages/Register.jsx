import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            toast.success('Account Created! Please log in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 text-center">
                <div className="mb-8">
                    <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-100">
                        <BookOpen size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Join Academy</h2>
                    <p className="text-gray-500 font-medium">Start your learning journey today.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center space-x-2 text-xs font-bold mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                            <input name="first_name" type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" onChange={handleChange} placeholder="John" />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                            <input name="last_name" type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" onChange={handleChange} placeholder="Doe" />
                        </div>
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Username *</label>
                        <input name="username" type="text" required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" onChange={handleChange} placeholder="johndoe123" />
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address *</label>
                        <input name="email" type="email" required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" onChange={handleChange} placeholder="name@example.com" />
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password *</label>
                        <input name="password" type="password" required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" onChange={handleChange} placeholder="••••••••" />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                        </button>
                    </div>
                </form>

                <div className="pt-8 border-t border-gray-50">
                    <p className="text-sm text-gray-500 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="font-black text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2">
                            Log in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
