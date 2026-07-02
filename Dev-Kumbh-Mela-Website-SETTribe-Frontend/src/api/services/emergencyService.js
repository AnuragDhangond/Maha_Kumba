import axiosInstance from '../axiosConfig';

export const emergencyService = {
    getSosList: async (page = 0, size = 10, searchTerm = '') => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', size);
            if (searchTerm) params.append('search', searchTerm);
            
            const response = await axiosInstance.get(`/api/emergency/list?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    acceptEmergency: async (id, adminName) => {
        try {
            const query = adminName ? `?adminName=${encodeURIComponent(adminName)}` : '';
            const response = await axiosInstance.post(`/api/emergency/accept/${id}${query}`, {});
            return response;
        } catch (error) {
            throw error;
        }
    },

    resolveEmergency: async (id, adminName) => {
        try {
            const query = adminName ? `?adminName=${encodeURIComponent(adminName)}` : '';
            const response = await axiosInstance.post(`/api/emergency/resolve/${id}${query}`, {});
            return response;
        } catch (error) {
            throw error;
        }
    },

    getEmergencyStatus: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/emergency/status/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getMyEmergencyStatus: async () => {
        try {
            const response = await axiosInstance.get(`/api/emergency/my-status`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createEmergency: async (emergencyData) => {
        try {
            const response = await axiosInstance.post('/api/emergency/create', emergencyData);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
