import axiosInstance from '../axiosConfig';

const BASE_URL = '/api/live-darshans';

export const liveDarshanService = {
    getAllLiveDarshans: async (searchTerm = '', page = 0, size = 10) => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', page);
            params.append('size', size);
            
            const response = await axiosInstance.get(`${BASE_URL}?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getLiveDarshanById: async (id) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createLiveDarshan: async (data) => {
        try {
            const response = await axiosInstance.post(BASE_URL, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateLiveDarshan: async (id, data) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteLiveDarshan: async (id) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
