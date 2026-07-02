import axiosInstance from '../../api/axiosConfig';

const operatorDashboardService = {
    getSummary: async () => {
        return axiosInstance.get('/api/operator/dashboard/summary');
    }
};

export default operatorDashboardService;
