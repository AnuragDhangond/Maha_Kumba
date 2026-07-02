import axiosInstance from '../axiosConfig';

export const poojaBookingService = {
    createBooking: (data) => axiosInstance.post('/api/pooja-bookings', data),
    getAllBookings: (searchTerm = '', page = 0, size = 10) => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        params.append('page', page);
        params.append('size', size);

        return axiosInstance.get(`/api/pooja-bookings?${params.toString()}`);
    },
    updateStatus: (id, status) => axiosInstance.patch(`/api/pooja-bookings/${id}/status`, { status }),
    getBookedSlots: (acharyaId, date) => axiosInstance.get(`/api/pooja-bookings/booked-slots`, { params: { acharyaId, date } })
};
