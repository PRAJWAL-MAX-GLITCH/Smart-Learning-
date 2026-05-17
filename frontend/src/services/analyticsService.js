import api from './api';

const analyticsService = {
    getDashboardStats: async () => {
        const response = await api.get('/analytics/dashboard');
        return response.data;
    },
    
    getRecommendations: async () => {
        const response = await api.get('/analytics/recommendations');
        return response.data;
    }
};

export default analyticsService;
