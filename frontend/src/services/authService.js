import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    adminLogin: async (email, password) => {
        const response = await api.post('/auth/admin-login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("Auth: Failed to parse user from storage", error);
            localStorage.removeItem('user');
            return null;
        }
    }
};

export default authService;
