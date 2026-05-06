import api from './api';

const quizService = {
    getQuizByCourse: async (courseId) => {
        const response = await api.get(`/quizzes/course/${courseId}`);
        return response.data;
    },

    submitQuiz: async (courseId, answers, timeTaken) => {
        const response = await api.post(`/quizzes/course/${courseId}/submit`, {
            answers,
            time_taken: timeTaken
        });
        return response.data;
    },

    getUserResults: async () => {
        const response = await api.get('/results/my');
        return response.data;
    },

    // Admin Specific Methods
    createQuestion: async (questionData) => {
        const response = await api.post('/quizzes/questions', questionData);
        return response.data;
    },

    updateQuestion: async (id, questionData) => {
        const response = await api.put(`/quizzes/questions/${id}`, questionData);
        return response.data;
    },

    deleteQuestion: async (id) => {
        const response = await api.delete(`/quizzes/questions/${id}`);
        return response.data;
    }
};

export default quizService;
