import axiosInstance, { refreshAuthToken } from '../axiosConfig';

export const authService = {
    loginUser: async (credentials) => {
        try {
            const response = await axiosInstance.post('/users/login', credentials);
            return response;
        } catch (error) {
            throw error;
        }
    },

    logoutUser: async () => {
        try {
            const response = await axiosInstance.post('/users/logout', {});
            return response;
        } catch (error) {
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get('/users/me');
            return response;
        } catch (error) {
            throw error;
        }
    },

    refreshUserToken: async () => {
        try {
            return await refreshAuthToken();
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (data) => {
        try {
            const response = await axiosInstance.post('/users/reset-password', data);
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
    }
};
