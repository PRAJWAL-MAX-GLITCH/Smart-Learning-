import api from './api';

const progressService = {
    getProgress: async (courseId) => {
        const response = await api.get(`/progress/${courseId}`);
        return response.data;
    },

    markAsCompleted: async (courseId) => {
        const response = await api.post('/progress/complete', { course_id: courseId });
        return response.data;
    },

    trackLessonProgress: async (courseId, lessonId) => {
        const response = await api.post('/progress/track', { course_id: courseId, lesson_id: lessonId });
        return response.data;
    }
};

export default progressService;
