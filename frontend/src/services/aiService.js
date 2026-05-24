import api from './api';

const aiService = {
    getWeakTopics: async () => {
        const response = await api.get('/ai/weak-topics');
        return response.data;
    },
    generateQuiz: async (courseId) => {
        const response = await api.post('/ai/generate-quiz', { course_id: courseId });
        return response.data;
    },
    getAiQuiz: async (courseId) => {
        const response = await api.get(`/ai/quiz/${courseId}`);
        return response.data;
    },
    sendChatMessage: async (message) => {
        const response = await api.post('/ai/chat', { message });
        return response.data;
    },
    getChatHistory: async () => {
        const response = await api.get('/ai/chat/history');
        return response.data;
    },
    clearChatHistory: async () => {
        const response = await api.post('/ai/chat/clear');
        return response.data;
    }
};

export default aiService;
