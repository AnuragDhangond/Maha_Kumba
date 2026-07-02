import axiosInstance from '../axiosConfig';

export const stayService = {
    getStays: async (searchTerm = '', page = 0, size = 10) => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', page);
            params.append('size', size);
            
            const response = await axiosInstance.get(`/api/stays?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createStay: async (formData) => {
        try {
            const response = await axiosInstance.post('/api/stays', formData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateStay: async (id, formData) => {
        try {
            const response = await axiosInstance.put(`/api/stays/${id}`, formData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteStay: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/stays/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
