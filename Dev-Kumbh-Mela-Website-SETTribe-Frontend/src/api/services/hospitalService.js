import axiosInstance from '../axiosConfig';

export const hospitalService = {
    getAllHospitals: async (page = 0, size = 10, searchTerm = '') => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', size);
            if (searchTerm) params.append('search', searchTerm);
            
            const response = await axiosInstance.get(`/api/hospitals?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getHospitalById: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/hospitals/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createHospital: async (hospitalData) => {
        try {
            const response = await axiosInstance.post('/api/hospitals', hospitalData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateHospital: async (id, hospitalData) => {
        try {
            const response = await axiosInstance.put(`/api/hospitals/${id}`, hospitalData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteHospital: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/hospitals/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    checkName: async (name) => {
        try {
            const response = await axiosInstance.get(`/api/hospitals/check-name?name=${encodeURIComponent(name)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    checkContact: async (contact) => {
        try {
            const response = await axiosInstance.get(`/api/hospitals/check-contact?contact=${encodeURIComponent(contact)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    checkLatitude: async (latitude) => {
        try {
            const response = await axiosInstance.get(`/api/hospitals/check-latitude?latitude=${latitude}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    checkLongitude: async (longitude) => {
        try {
            const response = await axiosInstance.get(`/api/hospitals/check-longitude?longitude=${longitude}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
