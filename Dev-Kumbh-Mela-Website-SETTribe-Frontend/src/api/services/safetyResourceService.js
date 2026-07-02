import axiosInstance from '../axiosConfig';

export const safetyResourceService = {
    getAllResources: async (page = 0, size = 10, searchTerm = '') => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', size);
            if (searchTerm) params.append('search', searchTerm);
            
            const response = await axiosInstance.get(`/api/safety-resources?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getResourceById: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/safety-resources/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createResource: async (resourceData) => {
        try {
            const response = await axiosInstance.post('/api/safety-resources', resourceData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateResource: async (id, resourceData) => {
        try {
            const response = await axiosInstance.put(`/api/safety-resources/${id}`, resourceData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteResource: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/safety-resources/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
