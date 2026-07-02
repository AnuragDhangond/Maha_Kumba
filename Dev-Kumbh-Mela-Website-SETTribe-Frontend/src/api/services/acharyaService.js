import axiosInstance from '../axiosConfig';

export const acharyaService = {
    getAllAcharyas: async (searchTerm = '', page = 0, size = 10) => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', page);
            params.append('size', size);
            
            const response = await axiosInstance.get(`/api/acharyas?${params.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    createAcharya: (acharyaData, imageFile) => {
        const formData = new FormData();
        formData.append('acharya', JSON.stringify(acharyaData));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        return axiosInstance.post('/api/acharyas', formData);
    },
    updateAcharya: (id, acharyaData, imageFile) => {
        const formData = new FormData();
        formData.append('acharya', JSON.stringify(acharyaData));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        return axiosInstance.put(`/api/acharyas/${id}`, formData);
    },
    deleteAcharya: (id) => {
        return axiosInstance.delete(`/api/acharyas/${id}`);
    }
};
