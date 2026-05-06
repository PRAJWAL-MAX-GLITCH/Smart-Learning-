import api from './api';

const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Potential future admin methods
    getAllUsers: async () => {
        const response = await api.get('/users/');
        return response.data;
    }
};

export default adminService;
