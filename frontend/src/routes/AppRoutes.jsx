import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CourseDetail from '../pages/CourseDetail';
import Quiz from '../pages/Quiz';
import QuizView from '../pages/QuizView';
import Result from '../pages/Result';
import Dashboard from '../pages/Dashboard';
import LessonView from '../pages/LessonView';
import Certificate from '../pages/Certificate';
import VerifyCertificate from '../pages/VerifyCertificate';
import Chatbot from '../pages/Chatbot';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import CourseManagement from '../pages/admin/CourseManagement';
import QuestionManagement from '../pages/admin/QuestionManagement';
import LessonManagement from '../pages/admin/LessonManagement';
import StudentManagement from '../pages/admin/StudentManagement';
import AdminActivityLogs from '../pages/admin/AdminActivityLogs';
import AdminSettings from '../pages/admin/AdminSettings';
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
            <Route path="/quiz/:id" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Quiz /></ProtectedRoute>} />
            <Route path="/ai-quiz/:id" element={<ProtectedRoute allowedRoles={['student', 'admin']}><QuizView /></ProtectedRoute>} />
            <Route path="/result/:id" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Result /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Chatbot /></ProtectedRoute>} />
            <Route path="/certificate/:courseId" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Certificate /></ProtectedRoute>} />

            {/* Public Verification Route */}
            <Route path="/verify/:certCode" element={<VerifyCertificate />} />

            {/* Admin Specific Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><CourseManagement /></ProtectedRoute>} />
            <Route path="/admin/courses/:courseId/lessons" element={<ProtectedRoute allowedRoles={['admin']}><LessonManagement /></ProtectedRoute>} />
            <Route path="/admin/courses/:courseId/questions" element={<ProtectedRoute allowedRoles={['admin']}><QuestionManagement /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><StudentManagement /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminActivityLogs /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

            {/* Aliases/Redirects */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Home />} />
        </Routes>
    );
};

export default AppRoutes;
