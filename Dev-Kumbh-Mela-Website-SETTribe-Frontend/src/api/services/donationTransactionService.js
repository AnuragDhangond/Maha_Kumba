import axiosInstance from '../axiosConfig';

const donationTransactionService = {
    submitDonation: async (donationData) => {
        const response = await axiosInstance.post('/api/donations', donationData);
        return response.data;
    },

    getAllDonations: async (page = 0, size = 10, searchTerm = '') => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (searchTerm) params.append('search', searchTerm);
        
        const response = await axiosInstance.get(`/api/donations?${params.toString()}`);
        return response.data;
    },

    verifyDonation: async (id) => {
        const response = await axiosInstance.patch(`/api/donations/${id}/verify`);
        return response.data;
    }
};

export default donationTransactionService;
