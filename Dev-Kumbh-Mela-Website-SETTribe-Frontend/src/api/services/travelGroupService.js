import axiosInstance from '../axiosConfig';

export const travelGroupService = {
    getTravelGroups: async (source = '', date = '') => {
        try {
            const params = new URLSearchParams();
            if (source) params.append('source', source);
            if (date) params.append('date', date);
            
            const response = await axiosInstance.get(`/api/travel-groups?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getAllTravelGroups: async () => {
        try {
            const response = await axiosInstance.get('/api/travel-groups/all');
            return response;
        } catch (error) {
            throw error;
        }
    },

    getTravelGroupById: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/travel-groups/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getTravelGroupMembers: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/travel-groups/${id}/members`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createTravelGroup: async (groupData) => {
        try {
            const response = await axiosInstance.post('/api/travel-groups', groupData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    joinTravelGroup: async (id, memberData) => {
        try {
            const response = await axiosInstance.post(`/api/travel-groups/${id}/join`, memberData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    joinTravelGroupByCode: async (joinData) => {
        try {
            const response = await axiosInstance.post('/api/travel-groups/join-by-code', joinData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteTravelGroup: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/travel-groups/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
