import axiosInstance from '../axiosConfig';

export const campService = {
    getActiveCamps: async () => {
        try {
            // We'll try to fetch from a generic content or a future camp endpoint
            // If it 404s, we'll return mock data in the component
            const response = await axiosInstance.get('/api/medical-camps/active');
            return response;
        } catch (error) {
            throw error;
        }
    }
};
