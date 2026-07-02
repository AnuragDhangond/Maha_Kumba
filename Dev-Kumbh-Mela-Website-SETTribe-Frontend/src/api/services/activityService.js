import axiosInstance from '../axiosConfig';

export const activityService = {
    getTotalUsersActivity: async () => {
        try {
            const response = await axiosInstance.get('/api/activity/total-users');
            return response;
        } catch (error) {
            throw error;
        }
    },

    getTodayOverview: async () => {
        try {
            const response = await axiosInstance.get('/api/activity/today-overview');
            return response;
        } catch (error) {
            throw error;
        }
    },

    getAllActivity: async (page, size, searchTerm = '') => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', size);
            if (searchTerm) params.append('search', searchTerm);
            
            const response = await axiosInstance.get(`/api/activity/all?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    trackActivity: async (activityData) => {
        try {
            const response = await axiosInstance.post('/api/activity/track', activityData);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
