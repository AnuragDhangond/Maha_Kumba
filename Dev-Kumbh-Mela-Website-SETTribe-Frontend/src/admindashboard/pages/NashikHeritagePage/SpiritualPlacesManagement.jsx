import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Swal from 'sweetalert2';
import '../../../styles/DashboardForms.css';

import useValidation from '../../../hooks/useValidation';
import { validateRequired } from '../../../utils/validationUtils';
import ValidationError from '../../../components/ValidationError';

// ── Component ─────────────────────────────────────────────────────────────────

const SpiritualPlacesManagement = () => {
    const [list, setList]               = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    const validationSchema = {
        placeName: [
            (v) => validateRequired(v) ? 'Place Name is required' : null,
            (v) => (/\d/.test(v) ? 'Place Name should not contain numbers' : null),
            (v) => (v && v.trim().length < 3 ? 'Place Name must be at least 3 characters' : null),
            (v) => (v && v.trim().length > 150 ? 'Place Name cannot exceed 150 characters' : null),
            (v) => (v && !/^[a-zA-Z\s.,'\-!?&()/:]+$/.test(v.trim()) ? 'Place Name contains invalid characters' : null)
        ],
        description: [
            (v) => (v && /\d/.test(v) ? 'Description should not contain numbers' : null),
            (v) => (v && v.trim().length < 10 ? 'Description must be at least 10 characters' : null),
            (v) => (v && v.trim().length > 3000 ? 'Description cannot exceed 3000 characters' : null)
        ],
        image: [
            (v) => {
                if (!v || !v.trim()) return null;
                try { new URL(v.trim()); return null; }
                catch { return 'Image URL must be a valid URL (e.g. https://...)'; }
            }
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
        placeName: '',
        description: '',
        image: '',
        displayOrder: 0,
        status: 'ACTIVE'
    }, validationSchema);

    useEffect(() => { fetchData(); }, [currentPage]);

    const fetchData = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/heritage/places', {
                params: { page: currentPage - 1, size: entriesPerPage }
            });
            if (res.data && res.data.content !== undefined) setList(res.data.content);
            else setList(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error fetching places:', error);
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

        try {
            if (editingItem) {
                await axiosInstance.put(`/api/admin/heritage/places/${editingItem.id}`, formData);
                Swal.fire({ title: 'Success', text: 'Place updated!', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await axiosInstance.post('/api/admin/heritage/places', formData);
                Swal.fire({ title: 'Success', text: 'Place added!', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm(); fetchData();
        } catch (error) { Swal.fire('Error', 'Submission failed.', 'error'); }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try { await axiosInstance.delete(`/api/admin/heritage/places/${id}`); fetchData(); }
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
                <div className="dashboard-header-modern"><h1 className="page-title">Spiritual Places</h1></div>
                {editingItem && <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>}
            </div>

            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Modify Spiritual Landmark' : 'Register New Sacred Place'}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern">

                        {/* Place Name */}
                        <div className={`form-group-modern form-span-2 ${errors.placeName ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Place Name <span className="required-mark">*</span></label>
                            <input type="text" name="placeName" value={formData.placeName} onChange={handleChange}
                                className={`form-input-modern ${errors.placeName ? 'has-error' : ''}`}
                                placeholder="e.g. Trimbakeshwar Temple" />
                            <ValidationError error={errors.placeName} />
                        </div>

                        {/* Display Order */}
                        <div className={`form-group-modern ${errors.displayOrder ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Display Order <span className="required-mark">*</span></label>
                            <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} min="0"
                                className={`form-input-modern ${errors.displayOrder ? 'has-error' : ''}`} />
                            <ValidationError error={errors.displayOrder} />
                        </div>

                        {/* Image URL */}
                        <div className={`form-group-modern form-span-2 ${errors.image ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Image URL</label>
                            <input type="text" name="image" value={formData.image} onChange={handleChange}
                                className={`form-input-modern ${errors.image ? 'has-error' : ''}`}
                                placeholder="https://..." />
                            <ValidationError error={errors.image} />
                        </div>

                        {/* Status */}
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-select-modern">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className={`form-group-modern form-span-3 ${errors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Place Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                                className={`form-input-modern ${errors.description ? 'has-error' : ''}`}
                                placeholder="Significance, mythology — at least 10 characters if provided..." />
                            <ValidationError error={errors.description} />
                        </div>

                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">{editingItem ? 'Update Place' : 'Register Place'}</button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">Reset</button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(33, 150, 243, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#2196F3' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Spiritual Pillars Registry</h2>
                        <span className="subtitle-static">Nashik Heritage • Sacred Geography Management</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #2196F3' }}>
                        <div className="m-vals"><span className="digit">{list.length}</span><span className="lab">Locations</span></div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper-premium" style={{ marginTop: '20px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead><tr><th>Place Details</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead>
                        <tbody>
                            {list.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div style={{ fontWeight: '800' }}>{item.placeName}</div>
                                        </div>
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
                        <button className="pager-btn" disabled={currentPage >= Math.ceil(list.length / entriesPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpiritualPlacesManagement;
