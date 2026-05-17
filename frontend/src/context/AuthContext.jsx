import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        // Check for stored session on mount
        const token = localStorage.getItem('token');
        const user = authService.getCurrentUser();

        if (token && user) {
            setAuthState({
                user,
                token,
                isAuthenticated: true,
                loading: false,
            });
        } else {
            setAuthState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        console.log("AuthContext: login success, updating state", data.role);
        setAuthState({
            user: data.user,
            token: data.token || data.access_token,
            isAuthenticated: true,
            loading: false,
        });
        return data;
    };

    const logout = () => {
        authService.logout();
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    const register = async (userData) => {
        return await authService.register(userData);
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
