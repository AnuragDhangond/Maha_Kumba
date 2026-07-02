import axiosInstance from '../axiosConfig';

export const poojaScheduleService = {
    getAllSchedules: async (searchTerm = '', page = 0, size = 10) => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', page);
            params.append('size', size);
            
            const response = await axiosInstance.get(`/api/pooja-schedules?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    createSchedule: (data) => {
        return axiosInstance.post('/api/pooja-schedules', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    updateSchedule: (id, data) => {
        return axiosInstance.put(`/api/pooja-schedules/${id}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    deleteSchedule: (id) => {
        return axiosInstance.delete(`/api/pooja-schedules/${id}`);
    }
};
