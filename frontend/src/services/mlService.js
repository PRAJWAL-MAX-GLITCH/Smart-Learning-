import api from './api';

const mlService = {
    getPrediction: async (userId) => {
        const response = await api.get(`/ml/predict/${userId}`);
        return response.data;
    }
};

export default mlService;
