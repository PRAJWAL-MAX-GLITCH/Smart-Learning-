import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CourseDetail from '../pages/CourseDetail';
import Quiz from '../pages/Quiz';
import Result from '../pages/Result';
import Dashboard from '../pages/Dashboard';
import LessonView from '../pages/LessonView';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import CourseManagement from '../pages/admin/CourseManagement';
import QuestionManagement from '../pages/admin/QuestionManagement';
import LessonManagement from '../pages/admin/LessonManagement';
import AdminLogin from '../pages/admin/AdminLogin';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student Routes */}
            <Route path="/courses/:id" element={<ProtectedRoute allowedRoles={['student', 'admin']}><CourseDetail /></ProtectedRoute>} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute allowedRoles={['student', 'admin']}><LessonView /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute allowedRoles={['student']}><Quiz /></ProtectedRoute>} />
            <Route path="/result/:id" element={<ProtectedRoute allowedRoles={['student']}><Result /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>} />

            {/* Admin Specific Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><CourseManagement /></ProtectedRoute>} />
            <Route path="/admin/courses/:courseId/lessons" element={<ProtectedRoute allowedRoles={['admin']}><LessonManagement /></ProtectedRoute>} />
            <Route path="/admin/courses/:courseId/questions" element={<ProtectedRoute allowedRoles={['admin']}><QuestionManagement /></ProtectedRoute>} />

            {/* Aliases/Redirects */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Home />} />
        </Routes>
    );
};

export default AppRoutes;
