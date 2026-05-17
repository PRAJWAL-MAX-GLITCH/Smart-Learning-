import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        console.log("LOGIN RESPONSE:", response.data);
        
        const token = response.data.token || response.data.access_token;
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("role", response.data.role);
            console.log("TOKEN:", token);
            console.log("ROLE:", response.data.role);
        }
        return response.data;
    },

    adminLogin: async (email, password) => {
        console.log("AuthService: adminLogin request started");
        const response = await api.post('/auth/admin-login', { email, password });
        console.log("LOGIN RESPONSE (ADMIN):", response.data);
        
        const token = response.data.token || response.data.access_token;
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("role", response.data.role);
            console.log("TOKEN:", token);
            console.log("ROLE:", response.data.role);
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
        localStorage.removeItem('role');
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
