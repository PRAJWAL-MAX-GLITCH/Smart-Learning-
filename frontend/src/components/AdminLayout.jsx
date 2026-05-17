import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3,
    BookOpen,
    LogOut,
    Home as HomeIcon,
    Settings,
    Users,
    ChevronRight,
    ShieldCheck,
    Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        toast.success("Admin Session Ended");
        navigate('/login');
    };

    const navItems = [
        { label: 'Overview', path: '/admin', icon: <BarChart3 size={20} /> },
        { label: 'Courses', path: '/admin/courses', icon: <BookOpen size={20} /> },
        { label: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { label: 'System Logs', path: '/admin/logs', icon: <Terminal size={20} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-72 bg-gray-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-20">
                <div className="p-8 border-b border-gray-800 flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <div className="font-black text-xl tracking-tighter">AdminPortal</div>
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SmartLearning</div>
                    </div>
                </div>

                <nav className="flex-grow p-6 space-y-2 mt-4">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">Menu</div>

                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}>
                                        {item.icon}
                                    </span>
                                    <span className="font-bold text-sm">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={14} className="opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-800 space-y-4">
                    <Link to="/" className="flex items-center space-x-4 p-4 text-gray-400 hover:text-white font-bold text-sm bg-white/5 rounded-2xl transition-colors">
                        <HomeIcon size={20} />
                        <span>Switch to Student View</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-4 p-4 text-red-400 hover:text-white hover:bg-red-900/30 rounded-2xl transition-all font-bold text-sm"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col h-screen overflow-y-auto">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                            Session: Active
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-black text-gray-900">{user?.first_name} {user?.last_name}</div>
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">System Administrator</div>
                        </div>
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="p-10 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
