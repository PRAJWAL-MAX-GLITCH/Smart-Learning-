import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [otp, setOtp] = useState("");
    const [tempData, setTempData] = useState(null);

    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log("Login: Attempting login for", email);

        try {
            const data = await login(email, password);
            console.log("Login: Response received", data);
            
            if (data?.two_factor_required || data?.['2fa_required'] || data?.status === 'OTP_REQUIRED') {
                console.log("Login: OTP required for this account");
                setShow2FA(true);
                setTempData(data);
                toast.success("Verification code sent to your email!");
                setLoading(false);
                return;
            }

            toast.success('Access Granted');
            console.log("TOKEN:", data.token);
            console.log("ROLE:", data.role);
            console.log("USER:", data.user);
            
            const userRole = (data.role || data.user?.role || "").toLowerCase();
            console.log("DETECTED ROLE:", userRole);

            // Redirect based on role
            if (userRole === 'admin') {
                console.log("NAVIGATING TO: /admin/dashboard");
                window.location.href = '/admin/dashboard';
            } else {
                const from = location.state?.from?.pathname || '/dashboard';
                console.log("NAVIGATING TO:", from);
                window.location.href = from;
            }
        } catch (err) {
            console.error("Login: Error", err);
            setError(err.response?.data?.error || 'Authentication Failed');
            toast.error(err.response?.data?.error || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Login: Verifying 2FA for", email);
        try {
            const endpoint = tempData?.status === 'OTP_REQUIRED' ? '/auth/verify-otp' : '/auth/verify-2fa';
            const payload = tempData?.status === 'OTP_REQUIRED' 
                ? { user_id: tempData.user_id, otp: otp }
                : { email: email, otp: otp };

            const response = await api.post(endpoint, payload);
            console.log("Login: 2FA Verified", response.data);
            
            const data = response.data;
            const token = data.token || data.access_token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.role);
            
            toast.success('Security Check Passed');
            console.log("DEBUG: 2FA Success, Role:", data.role);
            
            const userRole = (data.role || "").toLowerCase();
            if (userRole === 'admin') {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error("Login: 2FA Error", err);
            setError(err.response?.data?.error || 'Invalid Code');
            toast.error("Invalid verification code");
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
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                        {show2FA ? "Security Check" : "Welcome Back"}
                    </h2>
                    <p className="text-gray-500 font-medium">
                        {show2FA ? "Please enter the 6-digit verification code." : "Sign in to access your dashboard."}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center space-x-2 text-xs font-bold mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={show2FA ? handleVerify2FA : handleLogin} className="space-y-6">
                    {!show2FA ? (
                        <>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-center block w-full">Verification Code</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-blue-50 border-none rounded-2xl p-5 text-2xl font-black tracking-[1em] text-center focus:ring-2 focus:ring-blue-100 transition-all outline-none text-blue-600"
                                placeholder="000000"
                            />
                            <p className="text-[10px] text-gray-400 font-bold text-center mt-4 uppercase tracking-widest">
                                {tempData?.status === 'OTP_REQUIRED' ? "Check your email inbox" : "Mock Code: 123456"}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (show2FA ? "Verify & Sign In" : "Sign In to Portal")}
                    </button>
                    
                    {show2FA && (
                        <button 
                            type="button"
                            onClick={() => setShow2FA(false)}
                            className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900"
                        >
                            Back to Login
                        </button>
                    )}
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                    <p className="text-slate-500 text-sm font-medium">
                        Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up for free</Link>
                    </p>
                    <Link to="/admin/login" className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors">
                        Admin Portal Access
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
