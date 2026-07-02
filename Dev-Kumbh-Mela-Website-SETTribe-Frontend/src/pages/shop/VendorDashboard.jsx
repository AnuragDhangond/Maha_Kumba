import React, { useState, useEffect, useCallback } from 'react';
import { shopService } from '../../api/services/shopService';
import './VendorDashboard.css';

// ── Icon helpers (lucide-style SVG inline) ───────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const TABS = ['Overview', 'Products', 'Orders', 'Shop Settings'];

const STATUS_BADGE = {
  ACTIVE: 'badge-active', PENDING: 'badge-pending',
  BLOCKED: 'badge-blocked', APPROVED: 'badge-active',
  REJECTED: 'badge-blocked', CONFIRMED: 'badge-active',
  DELIVERED: 'badge-delivered', CANCELLED: 'badge-blocked',
};

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productImageFile, setProductImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [shopForm, setShopForm] = useState({
    shopName: '', ownerName: '', email: '', phone: '', whatsappNumber: '',
    description: '', category: '', subCategory: '', address: '',
    city: 'Nashik', state: 'Maharashtra', pincode: '',
    latitude: '', longitude: '', landmark: '',
    openingTime: '09:00', closingTime: '21:00', googleMapLink: '',
  });

  const [productForm, setProductForm] = useState({
    productName: '', description: '', price: '', discountedPrice: '',
    stockQuantity: '', category: '', tags: '', deliveryAvailable: true,
    status: 'ACTIVE', isFeatured: false,
  });

  // ── Data loading ─────────────────────────────────────────────────
  const loadMyShop = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shopService.getMyShop();
      setShop(res.data);
      setShowRegisterForm(false);
    } catch (e) {
      if (e?.response?.status === 404 || e?.response?.status === 400) {
        setShowRegisterForm(true);
      } else {
        setError('Failed to load shop data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    if (!shop?.id) return;
    try {
      const res = await shopService.getMyProducts(shop.id, { size: 50 });
      setProducts(res.data?.content || []);
    } catch { setProducts([]); }
  }, [shop?.id]);

  const loadOrders = useCallback(async () => {
    if (!shop?.id) return;
    try {
      const res = await shopService.getMyOrders(shop.id, { size: 50 });
      setOrders(res.data?.content || []);
    } catch { setOrders([]); }
  }, [shop?.id]);

  useEffect(() => { loadMyShop(); }, [loadMyShop]);
  useEffect(() => { loadProducts(); loadOrders(); }, [loadProducts, loadOrders]);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3500); };

  // ── Shop Registration ────────────────────────────────────────────
  const handleRegisterShop = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await shopService.registerShop({
        ...shopForm,
        latitude: parseFloat(shopForm.latitude),
        longitude: parseFloat(shopForm.longitude),
      });
      flash('Shop registered! Awaiting operator verification.');
      await loadMyShop();
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    } finally { setSaving(false); }
  };

  // ── Product CRUD ─────────────────────────────────────────────────
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ productName:'', description:'', price:'', discountedPrice:'',
      stockQuantity:'', category:'', tags:'', deliveryAvailable:true, status:'ACTIVE', isFeatured:false });
    setProductImageFile(null);
    setShowProductForm(true);
  };

  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({ productName: p.productName, description: p.description||'',
      price: p.price, discountedPrice: p.discountedPrice||'', stockQuantity: p.stockQuantity,
      category: p.category, tags: p.tags||'', deliveryAvailable: p.deliveryAvailable,
      status: p.status, isFeatured: p.isFeatured });
    setProductImageFile(null);
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dto = { ...productForm, price: parseFloat(productForm.price),
        discountedPrice: productForm.discountedPrice ? parseFloat(productForm.discountedPrice) : null,
        stockQuantity: parseInt(productForm.stockQuantity) };
      if (editingProduct) {
        await shopService.updateProduct(shop.id, editingProduct.id, dto, productImageFile);
        flash('Product updated.');
      } else {
        await shopService.addProduct(shop.id, dto, productImageFile);
        flash('Product added.');
      }
      setShowProductForm(false);
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product.');
    } finally { setSaving(false); }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Remove this product?')) return;
    try {
      await shopService.deleteProduct(shop.id, productId);
      flash('Product removed.');
      await loadProducts();
    } catch { setError('Failed to remove product.'); }
  };

  // ── Render ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="vd-loading">
      <div className="vd-spinner" />
      <p>Loading your vendor dashboard...</p>
    </div>
  );

  if (showRegisterForm) return (
    <div className="vd-register-wrap">
      <div className="vd-register-card">
        <div className="vd-register-header">
          <h1>🏪 Register Your Shop</h1>
          <p>Join the Mahakumbh Marketplace. Your shop will be reviewed by an operator before going live.</p>
        </div>
        {error && <div className="vd-alert error">{error}</div>}
        <form className="vd-form" onSubmit={handleRegisterShop}>
          <div className="vd-form-grid">
            <div className="vd-field"><label>Shop Name *</label>
              <input required value={shopForm.shopName} onChange={e => setShopForm(p=>({...p,shopName:e.target.value}))} /></div>
            <div className="vd-field"><label>Owner Name *</label>
              <input required value={shopForm.ownerName} onChange={e => setShopForm(p=>({...p,ownerName:e.target.value}))} /></div>
            <div className="vd-field"><label>Email *</label>
              <input type="email" required value={shopForm.email} onChange={e => setShopForm(p=>({...p,email:e.target.value}))} /></div>
            <div className="vd-field"><label>Phone *</label>
              <input required pattern="[6-9]\d{9}" value={shopForm.phone} onChange={e => setShopForm(p=>({...p,phone:e.target.value}))} /></div>
            <div className="vd-field"><label>WhatsApp Number</label>
              <input value={shopForm.whatsappNumber} onChange={e => setShopForm(p=>({...p,whatsappNumber:e.target.value}))} /></div>
            <div className="vd-field"><label>Category *</label>
              <select required value={shopForm.category} onChange={e => setShopForm(p=>({...p,category:e.target.value}))}>
                <option value="">Select category</option>
                {['Puja Items','Handicrafts','Clothing','Food & Sweets','Herbal & Wellness',
                  'Metalwork','Jewellery','Books & Scriptures','Electronics','Other']
                  .map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div className="vd-field vd-full"><label>Description</label>
              <textarea rows={3} value={shopForm.description} onChange={e => setShopForm(p=>({...p,description:e.target.value}))} /></div>
            <div className="vd-field vd-full"><label>Address *</label>
              <input required value={shopForm.address} onChange={e => setShopForm(p=>({...p,address:e.target.value}))} /></div>
            <div className="vd-field"><label>City</label>
              <input value={shopForm.city} onChange={e => setShopForm(p=>({...p,city:e.target.value}))} /></div>
            <div className="vd-field"><label>Pincode *</label>
              <input required pattern="[1-9][0-9]{5}" value={shopForm.pincode} onChange={e => setShopForm(p=>({...p,pincode:e.target.value}))} /></div>
            <div className="vd-field"><label>Latitude * <span className="vd-hint">(use Google Maps)</span></label>
              <input required type="number" step="any" value={shopForm.latitude} onChange={e => setShopForm(p=>({...p,latitude:e.target.value}))} /></div>
            <div className="vd-field"><label>Longitude *</label>
              <input required type="number" step="any" value={shopForm.longitude} onChange={e => setShopForm(p=>({...p,longitude:e.target.value}))} /></div>
            <div className="vd-field"><label>Opening Time *</label>
              <input type="time" required value={shopForm.openingTime} onChange={e => setShopForm(p=>({...p,openingTime:e.target.value}))} /></div>
            <div className="vd-field"><label>Closing Time *</label>
              <input type="time" required value={shopForm.closingTime} onChange={e => setShopForm(p=>({...p,closingTime:e.target.value}))} /></div>
            <div className="vd-field vd-full"><label>Google Maps Link</label>
              <input type="url" value={shopForm.googleMapLink} onChange={e => setShopForm(p=>({...p,googleMapLink:e.target.value}))} /></div>
          </div>
          <button type="submit" className="vd-btn-primary" disabled={saving}>
            {saving ? 'Submitting...' : '🚀 Submit Shop for Verification'}
          </button>
        </form>
      </div>
    </div>
  );

  // ── Main Dashboard ───────────────────────────────────────────────
  const totalRevenue = orders.filter(o => o.orderStatus === 'DELIVERED')
    .reduce((acc, o) => acc + (parseFloat(o.grandTotal) || 0), 0);

  return (
    <div className="vd-root">
      {/* Header */}
      <div className="vd-header">
        <div className="vd-shop-identity">
          {shop.logoImage
            ? <img className="vd-shop-logo" src={shopService.buildImageUrl(shop.logoImage)} alt={shop.shopName} />
            : <div className="vd-shop-logo-placeholder">🏪</div>}
          <div>
            <h1 className="vd-shop-name">{shop.shopName}</h1>
            <p className="vd-shop-meta">{shop.category} · {shop.city}</p>
          </div>
        </div>
        <div className="vd-verify-badge">
          <span className={`vd-badge ${STATUS_BADGE[shop.verificationStatus] || 'badge-pending'}`}>
            {shop.isVerified ? '✅ Verified' : `⏳ ${shop.verificationStatus}`}
          </span>
          <span className={`vd-badge ${STATUS_BADGE[shop.status] || 'badge-pending'}`}>
            {shop.status}
          </span>
        </div>
      </div>

      {/* Verification Banner */}
      {!shop.isVerified && (
        <div className="vd-verification-banner">
          <strong>🔍 Awaiting Verification</strong> — Your shop is under review. Products will be publicly visible once approved by an operator.
          {shop.verificationRemarks && <p className="vd-remarks">Remarks: {shop.verificationRemarks}</p>}
        </div>
      )}

      {successMsg && <div className="vd-alert success">{successMsg}</div>}
      {error && <div className="vd-alert error" onClick={() => setError('')}>{error} ✕</div>}

      {/* Tabs */}
      <div className="vd-tabs">
        {TABS.map(t => (
          <button key={t} className={`vd-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────── */}
      {activeTab === 'Overview' && (
        <div className="vd-section">
          <div className="vd-stats-grid">
            {[
              { label: 'Total Products', value: products.length, icon: '📦' },
              { label: 'Total Orders',   value: orders.length,   icon: '🛒' },
              { label: 'Shop Rating',    value: `${shop.rating || '—'} ★`, icon: '⭐' },
              { label: 'Revenue (Delivered)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: '💰' },
            ].map(s => (
              <div key={s.label} className="vd-stat-card">
                <span className="vd-stat-icon">{s.icon}</span>
                <div><p className="vd-stat-value">{s.value}</p><p className="vd-stat-label">{s.label}</p></div>
              </div>
            ))}
          </div>

          <div className="vd-info-grid">
            <div className="vd-info-block">
              <h3>Shop Information</h3>
              <table className="vd-info-table">
                <tbody>
                  {[['Owner', shop.ownerName], ['Email', shop.email], ['Phone', shop.phone],
                    ['Address', shop.address], ['City', shop.city], ['Pincode', shop.pincode],
                    ['Hours', `${shop.openingTime} – ${shop.closingTime}`],
                    ['Coordinates', `${shop.latitude}, ${shop.longitude}`]
                  ].map(([k, v]) => (
                    <tr key={k}><td className="vd-info-key">{k}</td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="vd-info-block">
              <h3>Recent Orders</h3>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="vd-mini-order">
                  <span className="vd-order-num">#{o.orderNumber}</span>
                  <span className={`vd-badge ${STATUS_BADGE[o.orderStatus] || 'badge-pending'}`}>{o.orderStatus}</span>
                  <span className="vd-order-amt">₹{parseFloat(o.grandTotal || o.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {orders.length === 0 && <p className="vd-empty">No orders yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCTS ─────────────────────────────────────────── */}
      {activeTab === 'Products' && (
        <div className="vd-section">
          <div className="vd-section-bar">
            <h2>Product Catalogue ({products.length})</h2>
            <button className="vd-btn-primary" onClick={openAddProduct}>+ Add Product</button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="vd-modal-overlay" onClick={() => setShowProductForm(false)}>
              <div className="vd-modal" onClick={e => e.stopPropagation()}>
                <div className="vd-modal-header">
                  <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                  <button className="vd-modal-close" onClick={() => setShowProductForm(false)}>✕</button>
                </div>
                <form className="vd-form" onSubmit={handleSaveProduct}>
                  <div className="vd-form-grid">
                    <div className="vd-field vd-full"><label>Product Name *</label>
                      <input required value={productForm.productName} onChange={e => setProductForm(p=>({...p,productName:e.target.value}))} /></div>
                    <div className="vd-field"><label>Price (₹) *</label>
                      <input required type="number" step="0.01" min="1" value={productForm.price} onChange={e => setProductForm(p=>({...p,price:e.target.value}))} /></div>
                    <div className="vd-field"><label>Discounted Price (₹)</label>
                      <input type="number" step="0.01" min="0" value={productForm.discountedPrice} onChange={e => setProductForm(p=>({...p,discountedPrice:e.target.value}))} /></div>
                    <div className="vd-field"><label>Stock Quantity *</label>
                      <input required type="number" min="1" value={productForm.stockQuantity} onChange={e => setProductForm(p=>({...p,stockQuantity:e.target.value}))} /></div>
                    <div className="vd-field"><label>Category *</label>
                      <input required value={productForm.category} onChange={e => setProductForm(p=>({...p,category:e.target.value}))} /></div>
                    <div className="vd-field vd-full"><label>Description</label>
                      <textarea rows={3} value={productForm.description} onChange={e => setProductForm(p=>({...p,description:e.target.value}))} /></div>
                    <div className="vd-field"><label>Tags (comma-separated)</label>
                      <input value={productForm.tags} onChange={e => setProductForm(p=>({...p,tags:e.target.value}))} /></div>
                    <div className="vd-field"><label>Status</label>
                      <select value={productForm.status} onChange={e => setProductForm(p=>({...p,status:e.target.value}))}>
                        {['ACTIVE','DRAFT','OUT_OF_STOCK'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select></div>
                    <div className="vd-field"><label>Product Image</label>
                      <input type="file" accept="image/*" onChange={e => setProductImageFile(e.target.files[0])} /></div>
                    <div className="vd-field vd-checkbox-row">
                      <label><input type="checkbox" checked={productForm.isFeatured}
                        onChange={e => setProductForm(p=>({...p,isFeatured:e.target.checked}))} /> Featured Product</label>
                      <label><input type="checkbox" checked={productForm.deliveryAvailable}
                        onChange={e => setProductForm(p=>({...p,deliveryAvailable:e.target.checked}))} /> Delivery Available</label>
                    </div>
                  </div>
                  <div className="vd-modal-actions">
                    <button type="button" className="vd-btn-outline" onClick={() => setShowProductForm(false)}>Cancel</button>
                    <button type="submit" className="vd-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="vd-products-grid">
            {products.map(p => (
              <div key={p.id} className="vd-product-card">
                <div className="vd-product-img">
                  {(p.imageUrl || p.thumbnail)
                    ? <img src={shopService.buildImageUrl(p.imageUrl || p.thumbnail)} alt={p.productName} />
                    : <div className="vd-product-img-placeholder">📦</div>}
                  {p.isFeatured && <span className="vd-featured-tag">★ Featured</span>}
                </div>
                <div className="vd-product-body">
                  <h4 className="vd-product-name">{p.productName}</h4>
                  <p className="vd-product-cat">{p.category}</p>
                  <div className="vd-product-price">
                    <span className="vd-price-main">₹{parseFloat(p.price).toLocaleString('en-IN')}</span>
                    {p.discountedPrice && <span className="vd-price-disc">₹{parseFloat(p.discountedPrice).toLocaleString('en-IN')}</span>}
                  </div>
                  <div className="vd-product-meta">
                    <span>Stock: {p.stockQuantity}</span>
                    <span className={`vd-badge ${STATUS_BADGE[p.status] || 'badge-pending'}`}>{p.status}</span>
                  </div>
                </div>
                <div className="vd-product-actions">
                  <button className="vd-btn-sm vd-btn-outline" onClick={() => openEditProduct(p)}>Edit</button>
                  <button className="vd-btn-sm vd-btn-danger" onClick={() => handleDeleteProduct(p.id)}>Remove</button>
                </div>
              </div>
            ))}
            {products.length === 0 && <div className="vd-empty-state">No products yet. Add your first product!</div>}
          </div>
        </div>
      )}

      {/* ── ORDERS ───────────────────────────────────────────── */}
      {activeTab === 'Orders' && (
        <div className="vd-section">
          <h2>Shop Orders ({orders.length})</h2>
          <div className="vd-orders-table-wrap">
            <table className="vd-orders-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="vd-order-num-cell">#{o.orderNumber}</td>
                    <td>{o.customerName}<br /><span className="vd-order-phone">{o.phone}</span></td>
                    <td>₹{parseFloat(o.grandTotal || o.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td><span className={`vd-badge ${STATUS_BADGE[o.paymentStatus] || 'badge-pending'}`}>{o.paymentStatus || '—'}</span></td>
                    <td><span className={`vd-badge ${STATUS_BADGE[o.orderStatus] || 'badge-pending'}`}>{o.orderStatus}</span></td>
                    <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="vd-empty-state">No orders received yet.</div>}
          </div>
        </div>
      )}

      {/* ── SHOP SETTINGS ────────────────────────────────────── */}
      {activeTab === 'Shop Settings' && (
        <div className="vd-section">
          <h2>Shop Settings</h2>
          <div className="vd-settings-card">
            <h4>Verification Status</h4>
            <p className={`vd-badge ${STATUS_BADGE[shop.verificationStatus] || 'badge-pending'}`} style={{display:'inline-block',fontSize:'1rem',padding:'6px 16px'}}>
              {shop.verificationStatus}
            </p>
            {shop.verificationRemarks && <p className="vd-remarks">"{shop.verificationRemarks}"</p>}
            <hr className="vd-divider"/>
            <h4>Shop Coordinates</h4>
            <p>Latitude: <strong>{shop.latitude}</strong> · Longitude: <strong>{shop.longitude}</strong></p>
            {shop.googleMapLink && (
              <a className="vd-map-link" href={shop.googleMapLink} target="_blank" rel="noreferrer">
                📍 View on Google Maps
              </a>
            )}
            <hr className="vd-divider"/>
            <h4>Contact Details</h4>
            <p>📧 {shop.email}</p>
            <p>📞 {shop.phone}</p>
            {shop.whatsappNumber && <p>💬 WhatsApp: {shop.whatsappNumber}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
