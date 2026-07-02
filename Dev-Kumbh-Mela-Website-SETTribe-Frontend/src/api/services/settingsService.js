import axiosInstance from '../axiosConfig';

export const settingsService = {
    getSettings: async () => {
        try {
            const response = await axiosInstance.get('/api/admin/settings');
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateSettings: async (settingsData) => {
        try {
            const response = await axiosInstance.put('/api/admin/settings', settingsData);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
