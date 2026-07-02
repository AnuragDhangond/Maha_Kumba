import axiosInstance from '../axiosConfig';

const homepageConfigService = {
    getConfig: async () => {
        try {
            const response = await axiosInstance.get('/api/homepage-config');
            return response.data;
        } catch (error) {
            console.error("Error fetching homepage config:", error);
            throw error;
        }
    },

    updateConfig: async (configData) => {
        try {
            const response = await axiosInstance.put('/api/admin/homepage-config', configData);
            return response.data;
        } catch (error) {
            console.error("Error updating homepage config:", error);
            throw error;
        }
    }
};

export default homepageConfigService;
