import axiosInstance from '../axiosConfig';

export const helplineService = {
    getHelplines: async (page = 0, size = 10, searchTerm = '', includeInactive = false) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', size);
            if (searchTerm) params.append('search', searchTerm);
            params.append('includeInactive', includeInactive);
            
            const response = await axiosInstance.get(`/api/helplines?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createHelpline: async (data) => {
        try {
            const response = await axiosInstance.post('/api/helplines', data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateHelpline: async (id, data) => {
        try {
            const response = await axiosInstance.put(`/api/helplines/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteHelpline: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/helplines/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    checkName: async (name) => {
        try {
            const response = await axiosInstance.get(`/api/helplines/check-name?name=${encodeURIComponent(name)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    checkNumber: async (number) => {
        try {
            const response = await axiosInstance.get(`/api/helplines/check-number?number=${encodeURIComponent(number)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
