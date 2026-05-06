import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                SmartLearning
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Courses</Link>

                        {user ? (
                            <>
                                {user.role === 'admin' ? (
                                    <Link to="/admin/dashboard" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-bold">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Admin Panel</span>
                                    </Link>
                                ) : (
                                    <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                )}
                                
                                <div className="flex items-center space-x-1 text-gray-700 px-3 py-2 text-sm font-medium border-l">
                                    <User className="h-4 w-4" />
                                    <span className="capitalize">{user.username} ({user.role})</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Login</Link>
                                <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
