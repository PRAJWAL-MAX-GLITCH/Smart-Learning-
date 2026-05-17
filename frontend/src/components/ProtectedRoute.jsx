import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Fallback: Check localStorage if user state is not yet synced
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role')?.toLowerCase();

    if (!user && !token) {
        console.log(`DEBUG [PROTECTED]: No user/token. Redirecting from ${location.pathname} to login.`);
        const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    const currentRole = (user?.role || storedRole || "").toLowerCase();
    console.log(`DEBUG [PROTECTED]: Role check on ${location.pathname}. Current: ${currentRole}, Allowed:`, allowedRoles);

    // Role check
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
        console.warn(`DEBUG [PROTECTED]: Access Denied for ${currentRole} on ${location.pathname}`);
        return <Navigate to={currentRole === 'admin' ? "/admin/dashboard" : "/dashboard"} replace />;
    }

    return children;
};

export default ProtectedRoute;
