import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Swal from 'sweetalert2';
import '../../../styles/DashboardForms.css';

import useValidation from '../../../hooks/useValidation';
import { validateRequired, validateImage } from '../../../utils/validationUtils';
import ValidationError from '../../../components/ValidationError';

// ── Component ─────────────────────────────────────────────────────────────────

const SaintsDirectoryManagement = () => {
    const [list, setList] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    const validationSchema = {
        name: [
            (v) => validateRequired(v) ? 'Full Name is required' : null,
            (v) => (/\d/.test(v) ? 'Full Name should not contain numbers' : null),
            (v) => (v && v.trim().length < 2 ? 'Full Name must be at least 2 characters' : null),
            (v) => (v && v.trim().length > 150 ? 'Full Name cannot exceed 150 characters' : null),
            (v) => (v && !/^[a-zA-Z\s.'\-]+$/.test(v.trim()) ? 'Full Name can only contain letters, spaces, dots, hyphens' : null)
        ],
        akhada: [
            (v) => validateRequired(v) ? 'Akhada / Movement is required' : null,
            (v) => (/\d/.test(v) ? 'Akhada / Movement should not contain numbers' : null),
            (v) => (v && v.trim().length < 2 ? 'Akhada / Movement must be at least 2 characters' : null),
            (v) => (v && v.trim().length > 200 ? 'Akhada / Movement cannot exceed 200 characters' : null),
            (v) => (v && !/^[a-zA-Z\s.,'\-!?&()/:]+$/.test(v.trim()) ? 'Akhada / Movement contains invalid characters' : null)
        ],
        role: [
            (v) => validateRequired(v) ? 'Role / Title is required' : null,
            (v) => (/\d/.test(v) ? 'Role / Title should not contain numbers' : null),
            (v) => (v && v.trim().length < 2 ? 'Role / Title must be at least 2 characters' : null),
            (v) => (v && v.trim().length > 200 ? 'Role / Title cannot exceed 200 characters' : null),
            (v) => (v && !/^[a-zA-Z\s.,'\-!?&()/:]+$/.test(v.trim()) ? 'Role / Title contains invalid characters' : null)
        ],
        image: [
            (v) => {
                if (!v) return 'Saint Photo is required';
                if (v instanceof File) {
                    return validateImage(v, { maxSizeMB: 10, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'], allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] }) || null;
                }
                return null;
            }
        ],
        description: [
            (v) => validateRequired(v) ? 'Biography / Description is required' : null,
            (v) => (/^\d+$/.test(v) ? 'Biography cannot be only numbers' : null),
            (v) => (v && v.trim().length < 10 ? 'Biography must be at least 10 characters' : null),
            (v) => (v && v.trim().length > 3000 ? 'Biography cannot exceed 3000 characters' : null)
        ],
        displayOrder: [
            (v) => {
                const n = Number(v);
                if (v === '' || v === null || v === undefined) return 'Display Order is required';
                if (isNaN(n) || !Number.isInteger(n)) return 'Display Order must be a whole number';
                if (n < 0) return 'Display Order cannot be negative';
                return null;
            }
        ]
    };

    const {
        values: formData,
        setValues: setFormData,
        errors,
        setErrors,
        handleChange,
        validateForm,
        resetForm: resetValidationForm
    } = useValidation({
        name: '',
        akhada: '',
        description: '',
        role: '',
        image: '',
        displayOrder: 0,
        status: 'ACTIVE'
    }, validationSchema);

    // Physically block numbers from being typed
    const preventNumbers = (e) => {
        if (/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    useEffect(() => { fetchData(); }, [currentPage]);

    const fetchData = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/heritage/saints', {
                params: { page: currentPage - 1, size: entriesPerPage }
            });
            if (res.data && res.data.content !== undefined) setList(res.data.content);
            else setList(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error fetching saints:', error);
            setList([]);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        resetValidationForm();
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                submitData.append(key, formData[key]);
            }
        });

        try {
            if (editingItem) {
                await axiosInstance.put(`/api/admin/heritage/saints/${editingItem.id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({ title: 'Success', text: 'Saint details updated!', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await axiosInstance.post('/api/admin/heritage/saints', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({ title: 'Success', text: 'New Saint added!', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm(); fetchData();
        } catch (error) { Swal.fire('Error', 'Submission failed.', 'error'); }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try { await axiosInstance.delete(`/api/admin/heritage/saints/${id}`); fetchData(); }
            catch (error) { console.error(error); }
        }
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
        setErrors({});
        const sc = document.querySelector('.admin-content');
        if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
                <div className="dashboard-header-modern"><h1 className="page-title">Saints &amp; Akhadas</h1></div>
                {editingItem && <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>}
            </div>

            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Modify Saint Record' : 'Register New Saint / Akhada'}</h3>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid-modern">

                        {/* Full Name */}
                        <div className={`form-group-modern ${errors.name ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Full Name <span className="required-mark">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} onKeyPress={preventNumbers}
                                className={`form-input-modern ${errors.name ? 'has-error' : ''}`}
                                placeholder="e.g. Swami Dayanand" />
                            <ValidationError error={errors.name} />
                        </div>

                        {/* Akhada */}
                        <div className={`form-group-modern ${errors.akhada ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Akhada / Movement <span className="required-mark">*</span></label>
                            <input type="text" name="akhada" value={formData.akhada} onChange={handleChange} onKeyPress={preventNumbers}
                                className={`form-input-modern ${errors.akhada ? 'has-error' : ''}`}
                                placeholder="e.g. Juna Akhada" />
                            <ValidationError error={errors.akhada} />
                        </div>

                        {/* Role */}
                        <div className={`form-group-modern ${errors.role ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Role / Title <span className="required-mark">*</span></label>
                            <input type="text" name="role" value={formData.role} onChange={handleChange} onKeyPress={preventNumbers}
                                className={`form-input-modern ${errors.role ? 'has-error' : ''}`}
                                placeholder="e.g. Spiritual Guide" />
                            <ValidationError error={errors.role} />
                        </div>

                        {/* Saint Photo */}
                        <div className={`form-group-modern ${errors.image ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Saint Photo <span className="required-mark">*</span></label>
                            <input type="file" name="image" onChange={handleChange} accept=".jpg,.jpeg,.png,.webp"
                                className={`form-input-modern ${errors.image ? 'has-error' : ''}`}
                                style={{ padding: '0.4rem' }} />
                            <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>Max 10MB (JPG, PNG, WebP)</span>
                            <ValidationError error={errors.image} />
                        </div>

                        {/* Display Order */}
                        <div className={`form-group-modern ${errors.displayOrder ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Display Order <span className="required-mark">*</span></label>
                            <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} min="0"
                                className={`form-input-modern ${errors.displayOrder ? 'has-error' : ''}`} />
                            <ValidationError error={errors.displayOrder} />
                        </div>

                        {/* Status */}
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-select-modern">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        {/* Biography */}
                        <div className={`form-group-modern form-span-3 ${errors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Biography / Description <span className="required-mark">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                                className={`form-input-modern ${errors.description ? 'has-error' : ''}`}
                                placeholder="Spiritual journey — at least 10 characters if provided..." />
                            <ValidationError error={errors.description} />
                        </div>

                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">{editingItem ? 'Update Saint Record' : 'Save Saint Record'}</button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">Reset</button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(76, 175, 80, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#4CAF50' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Saints &amp; Akhadas Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Spiritual Masters Directory</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4CAF50' }}>
                        <div className="m-vals"><span className="digit">{list.length}</span><span className="lab">Registered</span></div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper-premium" style={{ marginTop: '20px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead><tr><th>Saint Details</th><th>Akhada &amp; Role</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead>
                        <tbody>
                            {list.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {item.image
                                                ? <img src={item.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f5' }}></div>
                                            }
                                            <div style={{ fontWeight: '800' }}>{item.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700', color: '#ff7e36' }}>{item.akhada}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{item.role}</div>
                                    </td>
                                    <td><span className={`status-pill status-${item.status === 'ACTIVE' ? 'resolved' : 'pending'}`}>{item.status}</span></td>
                                    <td><span className="id-badge-alt">#{item.displayOrder}</span></td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => openEditForm(item)} className="btn-edit-modern">Edit</button>
                                            <button onClick={() => handleDelete(item.id)} className="btn-delete-modern">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-bar-premium">
                        <button className="pager-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</button>
                        <div className="pager-info">Page <strong>{currentPage}</strong> of {Math.ceil(list.length / entriesPerPage) || 1}</div>
                        <button className="pager-btn" disabled={list.length < entriesPerPage && currentPage === 1} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaintsDirectoryManagement;
