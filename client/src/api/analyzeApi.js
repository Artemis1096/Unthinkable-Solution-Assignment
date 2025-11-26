import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/analyze';

export const uploadDocument = async (formData, useLLM = false) => {
    formData.append('useLLM', useLLM);
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getRecentAnalyses = async () => {
    const response = await axios.get(`${API_BASE_URL}/recent`);
    return response.data;
};

export const clearRecentAnalyses = async () => {
    const response = await axios.delete(`${API_BASE_URL}/clear`);
    return response.data;
};
