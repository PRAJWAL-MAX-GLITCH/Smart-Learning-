import api from './api';

const aiService = {
    getWeakTopics: async () => {
        const response = await api.get('/ai/weak-topics');
        return response.data;
    }
};

export default aiService;
