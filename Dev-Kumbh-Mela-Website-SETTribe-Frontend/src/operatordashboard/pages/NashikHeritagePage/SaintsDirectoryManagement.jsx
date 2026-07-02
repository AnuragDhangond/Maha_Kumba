import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSaintDirectorySchema } from '../../../schemas/heritageSchemas';
import { scrollAndFocusError } from '../../../utils/validationUtils';
import '../../../styles/DashboardForms.css';

const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`).replace(/\/$/, '');

const SaintsDirectoryManagement = () => {
    const [list, setList] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const entriesPerPage = 10;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(getSaintDirectorySchema(!!editingItem)),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            akhada: '',
            role: '',
            description: '',
            image: null,
            displayOrder: 0,
            status: 'ACTIVE'
        }
    });

    const fileInputRef = useRef(null);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Fetch data on mount and when dependency changes
    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm]);

    const fetchData = async (search = searchTerm, page = currentPage) => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get('/api/admin/heritage/saints', {
                params: {
                    page: page - 1,
                    size: entriesPerPage,
                    search: search
                }
            });

            if (res.data && res.data.content !== undefined) {
                setList(res.data.content);
                setTotalPages(res.data.totalPages || 1);
                setTotalElements(res.data.totalElements || 0);
            } else {
                const data = Array.isArray(res.data) ? res.data : [];
                setList(data);
                setTotalPages(1);
                setTotalElements(data.length);
            }
        } catch (error) {
            console.error("Error fetching saints:", error);
            setList([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        reset({
            name: '',
            akhada: '',
            role: '',
            description: '',
            image: null,
            displayOrder: 0,
            status: 'ACTIVE'
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmitForm = async (data) => {
        const { image, ...cleanFormData } = data;
        const formDataPayload = new FormData();
        const saintBlob = new Blob([JSON.stringify(cleanFormData)], { type: 'application/json' });
        formDataPayload.append('saint', saintBlob);
        if (image && image.length > 0) {
            formDataPayload.append('image', image[0]);
        }

        setIsLoading(true);
        try {
            if (editingItem) {
                await axiosInstance.put(`/api/admin/heritage/saints/${editingItem.id}`, formDataPayload);
                Swal.fire({ title: 'Success', text: 'Saint details updated!', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await axiosInstance.post('/api/admin/heritage/saints', formDataPayload);
                Swal.fire({ title: 'Success', text: 'New Saint added!', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            let errorMsg = 'Submission failed.';
            if (error.response) {
                if (error.response.status === 413) {
                    errorMsg = 'Image size is too big. Maximum allowed size is 10MB.';
                } else if (error.response.data) {
                    const responseData = error.response.data;
                    if (responseData.errors && typeof responseData.errors === 'object') {
                        errorMsg = Object.values(responseData.errors).join(', ');
                    } else if (typeof responseData === 'string' && responseData.includes('MaxUploadSizeExceededException')) {
                        errorMsg = 'Image size is too big. Maximum allowed size is 10MB.';
                    } else if (responseData.message) {
                        if (responseData.message.includes('MaxUploadSizeExceededException') || responseData.message.includes('SizeLimitExceededException')) {
                            errorMsg = 'Image size is too big. Maximum allowed size is 10MB.';
                        } else {
                            errorMsg = responseData.message;
                        }
                    }
                }
            }
            Swal.fire('Error', errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try {
                await axiosInstance.delete(`/api/admin/heritage/saints/${id}`);
                fetchData();
            } catch (error) { console.error(error); }
        }
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        reset({
            name: item.name || '',
            akhada: item.akhada || '',
            role: item.role || '',
            description: item.description || '',
            image: null,
            displayOrder: item.displayOrder ?? 0,
            status: item.status || 'ACTIVE'
        });
        const scrollContainer = document.querySelector('.admin-content');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Saints & Akhadas</h1>
                </div>
                {editingItem && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Modify Saint Record' : 'Register New Saint / Akhada'}</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.name ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Full Name <span className="required-mark">*</span></label>
                            <input type="text" {...register('name')} className={`form-input-modern ${errors.name ? 'has-error' : ''}`} placeholder="e.g. Swami Dayanand" />
                            {errors.name && <div className="form-error-message">{errors.name.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.akhada ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Akhada / Movement <span className="required-mark">*</span></label>
                            <input type="text" {...register('akhada')} className={`form-input-modern ${errors.akhada ? 'has-error' : ''}`} placeholder="e.g. Juna Akhada" />
                            {errors.akhada && <div className="form-error-message">{errors.akhada.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.role ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Role / Title <span className="required-mark">*</span></label>
                            <input type="text" {...register('role')} className={`form-input-modern ${errors.role ? 'has-error' : ''}`} placeholder="e.g. Spiritual Guide" />
                            {errors.role && <div className="form-error-message">{errors.role.message}</div>}
                        </div>
                        <div className={`form-group-modern form-span-3 ${errors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Biography / Description <span className="required-mark">*</span></label>
                            <textarea {...register('description')} className={`form-input-modern ${errors.description ? 'has-error' : ''}`} placeholder="Spiritual journey..." rows="3"></textarea>
                            {errors.description && <div className="form-error-message">{errors.description.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.image ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Saint Photo {!editingItem && <span className="required-mark">*</span>}</label>
                            <input type="file" {...register('image')} ref={(e) => { register('image').ref(e); fileInputRef.current = e; }} className={`form-input-modern ${errors.image ? 'has-error' : ''}`} accept="image/jpeg,image/png,image/webp" />
                            {errors.image && <div className="form-error-message">{errors.image.message}</div>}
                            <small style={{ color: '#718096', fontSize: '0.8rem' }}>Max 10MB (JPG, PNG, WebP)</small>
                        </div>
                        <div className={`form-group-modern ${errors.displayOrder ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Display Order</label>
                            <input type="number" {...register('displayOrder')} className={`form-input-modern ${errors.displayOrder ? 'has-error' : ''}`} />
                            {errors.displayOrder && <div className="form-error-message">{errors.displayOrder.message}</div>}
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status</label>
                            <select {...register('status')} className="form-select-modern">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary" disabled={isLoading}>
                            {editingItem ? 'Update Saint' : 'Register Saint'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
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
                        <h2 className="title-static">Saints & Akhadas Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Spiritual Masters Directory</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4CAF50' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{list.length}</span>
                            <span className="lab">Registered</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Search saints by Name, Akhada or Role..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input-modern"
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            </div>

            <div className="table-wrapper-premium" style={{ marginTop: '20px', position: 'relative' }}>
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        borderRadius: '12px'
                    }}>
                        <div className="text-center">
                            <div style={{ fontSize: '2rem', animation: 'spin 2s linear infinite' }}>⌛</div>
                            <p>Loading...</p>
                        </div>
                    </div>
                )}
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Saint Details</th>
                            <th>Akhada & Role</th>
                            <th>Status</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    No saints found matching your search.
                                </td>
                            </tr>
                        ) : (
                            list.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {item.image ? (
                                                <img src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
                                            )}
                                            <div style={{ fontWeight: '800' }}>{item.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700', color: '#ff7e36' }}>{item.akhada}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{item.role}</div>
                                    </td>
                                    <td>
                                        <span className={`status-pill status-${item.status === 'ACTIVE' ? 'resolved' : 'pending'}`}>{item.status}</span>
                                    </td>
                                    <td><span className="id-badge-alt">#{item.displayOrder}</span></td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => openEditForm(item)} className="btn-edit-modern">
                                                {editingItem?.id === item.id ? 'Editing...' : 'Edit'}
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="btn-delete-modern">Delete</button>
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

export default SaintsDirectoryManagement;
