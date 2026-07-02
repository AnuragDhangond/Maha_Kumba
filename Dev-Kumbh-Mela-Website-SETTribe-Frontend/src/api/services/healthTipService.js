import axiosInstance from '../axiosConfig';

export const healthTipService = {
    getAllTips: async () => {
        try {
            const response = await axiosInstance.get('/api/health-tips');
            return response;
        } catch (error) {
            throw error;
        }
    },

    getTipsByCategory: async (category) => {
        try {
            const response = await axiosInstance.get(`/api/health-tips/category/${category}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createTip: async (tipData, imageFile) => {
        try {
            const formData = new FormData();
            formData.append('tip', JSON.stringify(tipData));
            if (imageFile) {
                console.log("Appending image to FormData:", imageFile.name, imageFile.type, imageFile.size);
                formData.append('image', imageFile);
            }

            const response = await axiosInstance.post('/api/health-tips', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            console.error("Create Tip Service Error:", error);
            throw error;
        }
    },

    updateTip: async (id, tipData, imageFile) => {
        try {
            const formData = new FormData();
            formData.append('tip', JSON.stringify(tipData));
            if (imageFile) {
                console.log("Appending image to FormData:", imageFile.name, imageFile.type, imageFile.size);
                formData.append('image', imageFile);
            }

            const response = await axiosInstance.put(`/api/health-tips/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            console.error("Update Tip Service Error:", error);
            throw error;
        }
    },

    deleteTip: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/health-tips/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
