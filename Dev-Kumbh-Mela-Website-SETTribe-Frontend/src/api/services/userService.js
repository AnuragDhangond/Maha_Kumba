import axiosInstance from '../axiosConfig';

export const userService = {
    getUsers: async (searchTerm = '', page = 0, size = 10) => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', page);
            params.append('size', size);
            
            const response = await axiosInstance.get(`/users/all?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    registerUser: async (userData) => {
        try {
            const response = await axiosInstance.post('/users/register', userData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    checkEmailExists: async (email) => {
        try {
            const response = await axiosInstance.get(`/users/check-email?email=${email}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    checkPassword: async (passwordData) => {
        try {
            const response = await axiosInstance.post('/users/check-password', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await axiosInstance.put(`/users/update/${id}`, userData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await axiosInstance.delete(`/users/delete/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
