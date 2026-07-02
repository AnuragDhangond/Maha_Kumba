import axiosInstance from '../axiosConfig';

const donationConfigService = {
    getConfig: async () => {
        const response = await axiosInstance.get('/api/donation-config');
        return response.data;
    },

    updateConfig: async (configData) => {
        const response = await axiosInstance.put('/api/donation-config', configData);
        return response.data;
    }
};

export default donationConfigService;
