import axiosInstance from '../axiosConfig';

// ── Vendor Application APIs ─────────────────────────────────────────

/** POST /api/vendors/apply — submit vendor registration */
const applyAsVendor = (data) =>
  axiosInstance.post('/api/vendors/apply', data);

/** POST /api/vendors/apply/documents — upload supporting documents */
const uploadDocuments = ({ document, license, logo, banner }) => {
  const form = new FormData();
  if (document) form.append('document', document);
  if (license)  form.append('license', license);
  if (logo)     form.append('logo', logo);
  if (banner)   form.append('banner', banner);
  return axiosInstance.post('/api/vendors/apply/documents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** GET /api/vendors/my-application — check own application status */
const getMyApplication = () =>
  axiosInstance.get('/api/vendors/my-application');

// ── Operator APIs ───────────────────────────────────────────────────

/** GET /api/operator/vendor-queue — paginated vendor application queue */
const getVendorQueue = (params = {}) =>
  axiosInstance.get('/api/operator/vendor-queue', { params });

/** GET /api/vendors/:id — get single application */
const getApplicationById = (id) =>
  axiosInstance.get(`/api/vendors/${id}`);

/** PATCH /api/vendors/:id/review */
const reviewApplication = (id, decision, remarks = '') =>
  axiosInstance.patch(`/api/vendors/${id}/review`, { decision, remarks });

/** PATCH /api/operator/vendors/:id/approve */
const approveVendor = (id) =>
  axiosInstance.patch(`/api/operator/vendors/${id}/approve`);

/** PATCH /api/operator/vendors/:id/reject */
const rejectVendor = (id, remarks) =>
  axiosInstance.patch(`/api/operator/vendors/${id}/reject`, { remarks });

// ── Product Moderation APIs ─────────────────────────────────────────

/** GET /api/operator/products/queue */
const getProductQueue = (params = {}) =>
  axiosInstance.get('/api/operator/products/queue', { params });

/** GET /api/operator/products/queue/count */
const getPendingProductCount = () =>
  axiosInstance.get('/api/operator/products/queue/count');

/** PATCH /api/operator/products/:id/approve */
const approveProduct = (id) =>
  axiosInstance.patch(`/api/operator/products/${id}/approve`);

/** PATCH /api/operator/products/:id/reject */
const rejectProduct = (id, reason) =>
  axiosInstance.patch(`/api/operator/products/${id}/reject`, { reason });

export const vendorApplicationService = {
  applyAsVendor,
  uploadDocuments,
  getMyApplication,
  getVendorQueue,
  getApplicationById,
  reviewApplication,
  approveVendor,
  rejectVendor,
  getProductQueue,
  getPendingProductCount,
  approveProduct,
  rejectProduct,
};

export default vendorApplicationService;
