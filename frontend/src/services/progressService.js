import api from './api';

const progressService = {
    getProgress: async (courseId) => {
        const response = await api.get(`/progress/${courseId}`);
        return response.data;
    },

    markAsCompleted: async (courseId) => {
        const response = await api.post('/progress/complete', { course_id: courseId });
        return response.data;
    }
};

export default progressService;
