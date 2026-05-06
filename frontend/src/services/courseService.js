import api from './api';

const courseService = {
    getAllCourses: async (page = 1, perPage = 10) => {
        const response = await api.get('/courses/', {
            params: { page, per_page: perPage }
        });
        return response.data;
    },

    getCourse: async (id) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    createCourse: async (courseData) => {
        const response = await api.post('/courses/', courseData);
        return response.data;
    },

    updateCourse: async (id, courseData) => {
        const response = await api.put(`/courses/${id}`, courseData);
        return response.data;
    },

    deleteCourse: async (id) => {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    }
};

export default courseService;
