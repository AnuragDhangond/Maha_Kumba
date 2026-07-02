import axiosInstance from '../../api/axiosConfig';

const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`).replace(/\/$/, '');

const shopService = {
    API_URL,
    buildImageUrl: (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    },
    // --- OPERATOR ENDPOINTS ---
    
    // Products
    createProduct: (formData) => axiosInstance.post('/api/operator/products', formData),
    updateProduct: (id, formData) => axiosInstance.put(`/api/operator/products/${id}`, formData),
    deleteProduct: (id) => axiosInstance.delete(`/api/operator/products/${id}`),
    getAllProductsOperator: (params) => axiosInstance.get('/api/operator/products', { params }),
    
    // Product Moderation
    getProductQueue: (params) => axiosInstance.get('/api/operator/products/queue', { params }),
    moderateProduct: (id, moderationData) => axiosInstance.post(`/api/operator/products/${id}/moderate`, moderationData),
    getPendingCount: () => axiosInstance.get('/api/operator/products/queue/count'),

    // Artisans
    createArtisan: (formData) => axiosInstance.post('/api/operator/artisans', formData),
    updateArtisan: (id, formData) => axiosInstance.put(`/api/operator/artisans/${id}`, formData),
    deleteArtisan: (id) => axiosInstance.delete(`/api/operator/artisans/${id}`),
    getAllArtisansOperator: (params) => axiosInstance.get('/api/operator/artisans', { params }),

    // Orders & Tracking
    getAllOrdersOperator: (params) => axiosInstance.get('/api/operator/orders', { params }),
    getOrderByIdOperator: (id) => axiosInstance.get(`/api/operator/orders/${id}`),
    updateTracking: (orderId, trackingData) => axiosInstance.put(`/api/operator/orders/${orderId}/tracking`, trackingData),
    updateDeliveryStatus: (orderId, statusData) => axiosInstance.put(`/api/operator/orders/${orderId}/delivery`, statusData),

    // --- PUBLIC ENDPOINTS ---
    getPublicProducts: (params) => axiosInstance.get('/api/public/products', { params }),
    getPublicArtisans: () => axiosInstance.get('/api/public/artisans'),

    // --- USER ENDPOINTS ---
    getCart: () => axiosInstance.get('/api/user/cart'),
    addToCart: (productId, quantity) => axiosInstance.post('/api/user/cart', { productId, quantity }),
    removeFromCart: (productId) => axiosInstance.delete(`/api/user/cart/${productId}`),
    
    checkout: (address, paymentMethod, customerName) => axiosInstance.post('/api/user/checkout', { address, paymentMethod, customerName }),
    getUserOrders: () => axiosInstance.get('/api/user/orders'),
    trackOrder: (orderNumber) => axiosInstance.get(`/api/user/orders/${orderNumber}/track`),

    getMyProductsUser: () => axiosInstance.get('/api/user/products'),

    updateSubmittedProductUser: (id, formData) => axiosInstance.put(`/api/user/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    submitProduct: (formData) => axiosInstance.post('/api/user/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Saved Addresses
    getUserAddresses: () => axiosInstance.get('/api/user/addresses'),
    saveUserAddress: (addressData) => axiosInstance.post('/api/user/addresses', addressData),
    updateUserAddress: (id, addressData) => axiosInstance.put(`/api/user/addresses/${id}`, addressData),
    deleteUserAddress: (id) => axiosInstance.delete(`/api/user/addresses/${id}`),
    setDefaultUserAddress: (id) => axiosInstance.put(`/api/user/addresses/${id}/default`)
};

export default shopService;


