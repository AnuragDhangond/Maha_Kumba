import axiosInstance from '../axiosConfig';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;

// ── Helpers ──────────────────────────────────────────────────────────
const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ══════════════════════════════════════════════════════════════════════
// PUBLIC DISCOVERY APIs (no auth required)
// ══════════════════════════════════════════════════════════════════════

/** GET /api/public/shops — paginated shop listing */
const getPublicShops = (params = {}) =>
  axiosInstance.get('/api/public/shops', { params });

/** GET /api/public/shops/nearby — geo-distance shop discovery */
const getNearbyShops = ({ lat, lng, radius = 5, category, page = 0, size = 20 } = {}) =>
  axiosInstance.get('/api/public/shops/nearby', { params: { lat, lng, radius, category, page, size } });

/** GET /api/public/shops/:slug — full shop detail */
const getShopBySlug = (slug) =>
  axiosInstance.get(`/api/public/shops/${slug}`);

/** GET /api/public/shops/:shopId/products — products for a shop */
const getShopProducts = (shopId, params = {}) =>
  axiosInstance.get(`/api/public/shops/${shopId}/products`, { params });

// ══════════════════════════════════════════════════════════════════════
// VENDOR APIs (requires authenticated user)
// ══════════════════════════════════════════════════════════════════════

/** POST /api/vendor/shops — register a new shop */
const registerShop = (shopData) =>
  axiosInstance.post('/api/vendor/shops', shopData);

/** GET /api/vendor/shops/my — get the current vendor's shop */
const getMyShop = () =>
  axiosInstance.get('/api/vendor/shops/my');

/** PUT /api/vendor/shops/:shopId — update shop details */
const updateShop = (shopId, shopData) =>
  axiosInstance.put(`/api/vendor/shops/${shopId}`, shopData);

/** POST /api/vendor/shops/:shopId/images — upload logo + banner */
const uploadShopImages = (shopId, logo, banner) => {
  const form = new FormData();
  if (logo)   form.append('logo', logo);
  if (banner) form.append('banner', banner);
  return axiosInstance.post(`/api/vendor/shops/${shopId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** DELETE /api/vendor/shops/:shopId — deactivate own shop */
const deleteShop = (shopId) =>
  axiosInstance.delete(`/api/vendor/shops/${shopId}`);

// ── Vendor Products ───────────────────────────────────────────────────

/** POST /api/vendor/shops/:shopId/products */
const addProduct = (shopId, productData, imageFile) => {
  const form = new FormData();
  form.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
  if (imageFile) form.append('image', imageFile);
  return axiosInstance.post(`/api/vendor/shops/${shopId}/products`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** GET /api/vendor/shops/:shopId/products */
const getMyProducts = (shopId, params = {}) =>
  axiosInstance.get(`/api/vendor/shops/${shopId}/products`, { params });

/** PUT /api/vendor/shops/:shopId/products/:productId */
const updateProduct = (shopId, productId, productData, imageFile) => {
  const form = new FormData();
  form.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
  if (imageFile) form.append('image', imageFile);
  return axiosInstance.put(`/api/vendor/shops/${shopId}/products/${productId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** DELETE /api/vendor/shops/:shopId/products/:productId */
const deleteProduct = (shopId, productId) =>
  axiosInstance.delete(`/api/vendor/shops/${shopId}/products/${productId}`);

/** GET /api/vendor/shops/:shopId/orders */
const getMyOrders = (shopId, params = {}) =>
  axiosInstance.get(`/api/vendor/shops/${shopId}/orders`, { params });

// ══════════════════════════════════════════════════════════════════════
// OPERATOR APIs
// ══════════════════════════════════════════════════════════════════════

/** GET /api/operator/shops */
const operatorGetAllShops = (params = {}) =>
  axiosInstance.get('/api/operator/shops', { params });

/** GET /api/operator/shops/:shopId */
const operatorGetShop = (shopId) =>
  axiosInstance.get(`/api/operator/shops/${shopId}`);

/** POST /api/operator/shops/:shopId/verify */
const operatorVerifyShop = (shopId, decision, remarks = '') =>
  axiosInstance.post(`/api/operator/shops/${shopId}/verify`, { decision, remarks });

/** POST /api/operator/shops/:shopId/suspend */
const operatorSuspendShop = (shopId, reason) =>
  axiosInstance.post(`/api/operator/shops/${shopId}/suspend`, { reason });

/** POST /api/operator/shops/:shopId/reactivate */
const operatorReactivateShop = (shopId) =>
  axiosInstance.post(`/api/operator/shops/${shopId}/reactivate`);

/** GET /api/operator/shops/analytics */
const operatorGetShopAnalytics = () =>
  axiosInstance.get('/api/operator/shops/analytics');

// ══════════════════════════════════════════════════════════════════════
// LEGACY (existing ShopPage.jsx uses these)
// ══════════════════════════════════════════════════════════════════════

const getPublicProducts = (category) =>
  axiosInstance.get('/api/public/products', { params: category ? { category } : {} });

const getPublicArtisans = () =>
  axiosInstance.get('/api/public/artisans');

const getCart = () => axiosInstance.get('/api/user/cart');
const addToCart = (productId, quantity) =>
  axiosInstance.post('/api/user/cart', { productId, quantity });
const removeFromCart = (productId) =>
  axiosInstance.delete(`/api/user/cart/${productId}`);
const checkout = (data) => axiosInstance.post('/api/user/checkout', data);
const getUserOrders = () => axiosInstance.get('/api/user/orders');
const trackOrder = (orderNumber) =>
  axiosInstance.get(`/api/user/orders/${orderNumber}/track`);

export const shopService = {
  API_URL,
  buildImageUrl,
  // Public discovery
  getPublicShops,
  getNearbyShops,
  getShopBySlug,
  getShopProducts,
  // Vendor
  registerShop,
  getMyShop,
  updateShop,
  uploadShopImages,
  deleteShop,
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getMyOrders,
  // Operator
  operatorGetAllShops,
  operatorGetShop,
  operatorVerifyShop,
  operatorSuspendShop,
  operatorReactivateShop,
  operatorGetShopAnalytics,
  // Legacy
  getPublicProducts,
  getPublicArtisans,
  getCart,
  addToCart,
  removeFromCart,
  checkout,
  getUserOrders,
  trackOrder,
};

export default shopService;
