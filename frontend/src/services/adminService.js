import api from './api';

const adminService = {
    getStats: async () => {
        // We can use the new analytics endpoint for richer data
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await api.post('/admin/settings', settings);
        return response.data;
    },

    getStudents: async () => {
        const response = await api.get('/admin/students');
        return response.data;
    }
};

export default adminService;
