import React, { useState, useEffect, useRef } from 'react';
import shopService from '../../services/shopService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProductSchema } from '../../../schemas/shopSchemas';
import { scrollAndFocusError } from '../../../utils/validationUtils';
import '../../../styles/DashboardForms.css';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const entriesPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(getProductSchema(!!editingItem)),
        mode: 'onTouched',
        defaultValues: {
            productName: '',
            category: '',
            price: '',
            stockQuantity: '',
            isActive: true,
            description: '',
            image: null
        }
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const fetchProducts = async () => {
        try {
            const params = {
                page: currentPage - 1,
                size: entriesPerPage,
                search: searchTerm || undefined,
                sortBy: sortConfig.key,
                direction: sortConfig.direction
            };
            const res = await shopService.getAllProductsOperator(params);
            setProducts(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, sortConfig]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const onSubmitForm = async (data) => {
        const { image, ...cleanFormData } = data;
        const formDataPayload = new FormData();
        const body = { ...cleanFormData, id: editingItem?.id || null };
        const productBlob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        formDataPayload.append('product', productBlob);
        if (image && image.length > 0) {
            formDataPayload.append('image', image[0]);
        }

        setIsLoading(true);
        try {
            if (editingItem) {
                await shopService.updateProduct(editingItem.id, formDataPayload);
                Swal.fire('Updated!', 'Product has been updated successfully.', 'success');
            } else {
                await shopService.createProduct(formDataPayload);
                Swal.fire('Created!', 'New product has been added.', 'success');
            }
            fetchProducts();
            closeForm();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to save product. Please check your input.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (prod) => {
        setEditingItem(prod);
        reset({
            productName: prod.productName || '',
            category: prod.category || '',
            price: prod.price ?? '',
            stockQuantity: prod.stockQuantity ?? '',
            isActive: prod.isActive ?? true,
            description: prod.description || '',
            image: null
        });
        document.getElementById('management-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff5252',
            cancelButtonColor: '#4a2a18',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await shopService.deleteProduct(id);
                Swal.fire('Deleted!', 'Product has been removed.', 'success');
                fetchProducts();
            } catch (err) {
                console.error(err);
                Swal.fire('Error!', 'Failed to delete product. It might be linked to existing orders.', 'error');
            }
        }
    };

    const closeForm = () => {
        setEditingItem(null);
        reset({
            productName: '',
            category: '',
            price: '',
            stockQuantity: '',
            isActive: true,
            description: '',
            image: null
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Product Management</h1>
                </div>
                {editingItem && (
                    <button onClick={closeForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div id="management-form" className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.productName ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Product Name <span className="required-mark">*</span></label>
                            <input type="text" {...register('productName')} className={`form-input-modern ${errors.productName ? 'has-error' : ''}`} placeholder="e.g. Rudraksha Mala" />
                            {errors.productName && <div className="form-error-message">{errors.productName.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.category ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Category <span className="required-mark">*</span></label>
                            <input type="text" {...register('category')} className={`form-input-modern ${errors.category ? 'has-error' : ''}`} placeholder="e.g. Spiritual" />
                            {errors.category && <div className="form-error-message">{errors.category.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.price ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Price (₹) <span className="required-mark">*</span></label>
                            <input type="number" step="1" min="1" {...register('price')} className={`form-input-modern ${errors.price ? 'has-error' : ''}`} placeholder="0" />
                            {errors.price && <div className="form-error-message">{errors.price.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.stockQuantity ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Stock Quantity <span className="required-mark">*</span></label>
                            <input type="number" min="1" {...register('stockQuantity')} className={`form-input-modern ${errors.stockQuantity ? 'has-error' : ''}`} placeholder="Available units" />
                            {errors.stockQuantity && <div className="form-error-message">{errors.stockQuantity.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.image ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Product Image <span className="required-mark">*</span></label>
                            <input type="file" {...register('image')} ref={(e) => { register('image').ref(e); fileInputRef.current = e; }} className={`form-input-modern ${errors.image ? 'has-error' : ''}`} accept="image/jpeg,image/png,image/webp" />
                            {errors.image && <div className="form-error-message">{errors.image.message}</div>}
                            <small style={{ color: '#718096', fontSize: '0.8rem' }}>Max 10MB (JPG, PNG, WebP)</small>
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status</label>
                            <select {...register('isActive')} className="form-select-modern">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <div className={`form-group-modern form-span-3 ${errors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Description</label>
                            <textarea {...register('description')} className={`form-input-modern ${errors.description ? 'has-error' : ''}`} rows="3" placeholder="Detailed product features..."></textarea>
                            {errors.description && <div className="form-error-message">{errors.description.message}</div>}
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary" disabled={isLoading}>
                            {editingItem ? 'Update Product' : 'Add Product'}
                        </button>
                        <button type="button" onClick={closeForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(76, 175, 80, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#4CAF50' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Products Directory</h2>
                        <span className="subtitle-static">Maha Kumbh • Spiritual Shop Products</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4CAF50' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Items</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search by product name, category, or status (Active/Inactive)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input-modern"
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            </div>

            <div className="table-wrapper-premium" style={{ marginTop: '20px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('productName')} style={{ cursor: 'pointer' }}>
                                Product Info {sortConfig.key === 'productName' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                                Category {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('stockQuantity')} style={{ cursor: 'pointer' }}>
                                Stock {sortConfig.key === 'stockQuantity' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th>Moderation</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No products found.</td></tr>
                        ) : (
                            products.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${shopService.API_URL}${p.imageUrl.startsWith('/') ? '' : '/'}${p.imageUrl}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: '800' }}>{p.productName}</div>
                                                <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>₹{p.price}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700', color: '#ff7e36' }}>{p.category}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{p.stockQuantity}</div>
                                    </td>
                                    <td>
                                        <span className={`status-pill status-${
                                            p.moderationStatus === 'APPROVED' ? 'resolved' : 
                                            p.moderationStatus === 'PENDING' ? 'pending' : 
                                            p.moderationStatus === 'CHANGES_REQUESTED' ? 'warning' : 'critical'
                                        }`}>
                                            {p.moderationStatus || 'APPROVED'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill status-${p.isActive ? 'resolved' : 'pending'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => handleEdit(p)} className="btn-edit-modern">
                                                {editingItem?.id === p.id ? 'Editing...' : 'Edit'}
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="btn-delete-modern">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="pagination-bar-premium">
                    <button 
                        className="pager-btn" 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        Previous
                    </button>
                    <div className="pager-info">
                        Page <strong>{currentPage}</strong> of {totalPages}
                    </div>
                    <button 
                        className="pager-btn" 
                        disabled={currentPage >= totalPages} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
