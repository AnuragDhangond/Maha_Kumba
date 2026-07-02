import axiosInstance from '../axiosConfig';

export const liveUpdateService = {
    getAllUpdates: async (search = '', category = '', page = null, size = null) => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (page !== null) params.append('page', page);
            if (size !== null) params.append('size', size);
            
            const queryString = params.toString();
            const url = `/api/live-updates${queryString ? `?${queryString}` : ''}`;
            const response = await axiosInstance.get(url);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createUpdate: async (data) => {
        try {
            const response = await axiosInstance.post('/api/live-updates', data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateLiveUpdate: async (id, data) => {
        try {
            const response = await axiosInstance.put(`/api/live-updates/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteLiveUpdate: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/live-updates/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
