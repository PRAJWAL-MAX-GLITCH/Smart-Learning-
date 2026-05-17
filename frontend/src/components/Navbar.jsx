import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LayoutDashboard, User, Search, Bell, Menu, Check, Trash2, Clock } from 'lucide-react';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (user && user.role === 'student') {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (err) {
            toast.error("Failed to update notification");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
            toast.success("All caught up!");
        } catch (err) {
            toast.error("Failed to clear notifications");
        }
    };

    const handleLogout = () => {
        const hour = new Date().getHours();
        let message = 'Logged out successfully';
        
        if (hour >= 21 || hour < 5) message = 'Good night! See you tomorrow! 🌙';
        else if (hour >= 5 && hour < 12) message = 'Have a productive morning! ☀️';
        else if (hour >= 12 && hour < 17) message = 'Hope you had a great afternoon! 🌤️';
        else message = 'Have a relaxing evening! 🌆';

        logout();
        toast.success(message, { duration: 4000 });
        navigate('/login');
    };

    const formatTime = (dateString) => {
        const normalizedDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const date = new Date(normalizedDate);
        const today = new Date();
        const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return isToday ? timeStr : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 w-full">
            <div className="w-full px-6 lg:px-12">
                <div className="flex justify-between h-20">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="bg-blue-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">SmartLearning</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Education Portal</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="hidden md:block text-gray-500 hover:text-blue-600 text-xs font-black uppercase tracking-widest transition-colors">Explore</Link>

                        {user ? (
                            <div className="flex items-center space-x-4 border-l pl-6 border-gray-100">
                                {/* Notifications - Student Only */}
                                {user.role === 'student' && (
                                    <div className="relative" ref={notificationRef}>
                                        <button 
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`}
                                        >
                                            <Bell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                            )}
                                        </button>

                                        {showNotifications && (
                                            <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <button 
                                                            onClick={handleMarkAllRead}
                                                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                                                        >
                                                            Clear All
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="max-h-[400px] overflow-y-auto">
                                                    {notifications.length > 0 ? (
                                                        notifications.map((n) => (
                                                            <div key={n.id} className={`p-5 border-b border-gray-50 flex gap-4 hover:bg-gray-50 transition-colors group ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                                                                <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                                                                    n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                    {n.type === 'success' ? <Check size={18} /> : <Bell size={18} />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <p className={`text-xs font-black truncate ${!n.is_read ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                                                                        <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap ml-2">{formatTime(n.created_at)}</span>
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                                                                    {!n.is_read && (
                                                                        <button 
                                                                            onClick={() => handleMarkRead(n.id)}
                                                                            className="mt-2 text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            Mark as read
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-12 text-center">
                                                            <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                                <Bell className="text-gray-300" size={20} />
                                                            </div>
                                                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No notifications</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Role-based Action Button */}
                                {user.role === 'admin' ? (
                                    <Link to="/admin/dashboard" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">
                                        Admin Panel
                                    </Link>
                                ) : (
                                    <Link to="/dashboard" className="hidden sm:flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                                    </Link>
                                )}
                                
                                {/* User Profile */}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden lg:block">
                                        <div className="text-xs font-black text-gray-900 leading-none mb-1 capitalize">{user?.username || 'Learner'}</div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{user?.role || 'student'}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-500 hover:text-blue-600 text-xs font-black uppercase tracking-widest">Sign In</Link>
                                <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5 active:scale-95">
                                    Join for Free
                                </Link>
                            </div>
                        )}
                        <button className="md:hidden p-2 text-gray-500">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
