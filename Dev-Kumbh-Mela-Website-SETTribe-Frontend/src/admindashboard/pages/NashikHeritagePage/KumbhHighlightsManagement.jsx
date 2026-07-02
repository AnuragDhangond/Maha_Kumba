import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Swal from 'sweetalert2';
import '../../../styles/DashboardForms.css';

// ── Validators ────────────────────────────────────────────────────────────────

const validateYear = (v) => {
    if (!v || !v.trim()) return 'Year / Duration is required';
    if (/^\d+$/.test(v.trim())) return 'Year / Duration cannot be only numbers — e.g. "August 2015"';
    if (v.trim().length < 2) return 'Year / Duration must be at least 2 characters';
    if (v.trim().length > 50) return 'Year / Duration cannot exceed 50 characters';
    if (!/^[a-zA-Z0-9\s.\-/]+$/.test(v.trim())) return 'Year / Duration contains invalid characters';
    return '';
};

const validateTitle = (v) => {
    if (!v || !v.trim()) return 'Highlight Title is required';
    if (/^\d+$/.test(v.trim())) return 'Highlight Title cannot be only numbers';
    if (v.trim().length < 3) return 'Highlight Title must be at least 3 characters';
    if (v.trim().length > 200) return 'Highlight Title cannot exceed 200 characters';
    if (!/^[a-zA-Z0-9\s.,'\-!?&()/:]+$/.test(v.trim())) return 'Highlight Title contains invalid characters';
    return '';
};

const validateDescription = (v) => {
    if (!v || !v.trim()) return 'Description is required';
    if (/^\d+$/.test(v.trim())) return 'Description cannot be only numbers';
    if (v.trim().length < 10) return 'Description must be at least 10 characters';
    if (v.trim().length > 2000) return 'Description cannot exceed 2000 characters';
    return '';
};

const validateUrl = (v, label) => {
    if (!v || !v.trim()) return '';   // optional
    try { new URL(v.trim()); return ''; }
    catch { return `${label} must be a valid URL (e.g. https://...)`; }
};

const validateThumbnailFile = (v) => {
    if (!v) return 'Thumbnail Image is required';
    if (v instanceof File) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(v.type)) return 'Only JPG, PNG, and WebP are allowed';
        if (v.size > 10 * 1024 * 1024) return 'File size cannot exceed 10MB';
    } else if (typeof v === 'string' && !v.trim()) {
        return 'Thumbnail Image is required';
    }
    return '';
};

const validateDisplayOrder = (v) => {
    const n = Number(v);
    if (v === '' || v === null || v === undefined) return 'Display Order is required';
    if (isNaN(n) || !Number.isInteger(n)) return 'Display Order must be a whole number';
    if (n < 0) return 'Display Order cannot be negative';
    return '';
};

const INITIAL_ERRORS = {
    year: '', title: '', description: '',
    videoUrl: '', thumbnailImage: '', displayOrder: ''
};

const INITIAL_FORM = {
    year: '', title: '', description: '',
    videoUrl: '', thumbnailImage: '', displayOrder: 0, status: 'ACTIVE'
};

// ── Component ─────────────────────────────────────────────────────────────────

const KumbhHighlightsManagement = () => {
    const [list, setList] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState(INITIAL_ERRORS);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    useEffect(() => { fetchData(); }, [currentPage]);

    const fetchData = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/heritage/highlights', {
                params: { page: currentPage - 1, size: entriesPerPage }
            });
            if (res.data && res.data.content !== undefined) {
                setList(res.data.content);
            } else {
                setList(Array.isArray(res.data) ? res.data : []);
            }
        } catch (error) {
            console.error('Error fetching highlights:', error);
            setList([]);
        }
    };

    // Real-time validation on every keystroke
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        let err = '';
        switch (name) {
            case 'year':           err = validateYear(value); break;
            case 'title':          err = validateTitle(value); break;
            case 'description':    err = validateDescription(value); break;
            case 'videoUrl':       err = validateUrl(value, 'Video URL'); break;
            case 'thumbnailImage': err = validateThumbnailFile(value); break;
            case 'displayOrder':   err = validateDisplayOrder(value); break;
            default: break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, thumbnailImage: file }));
        setFieldErrors(prev => ({ ...prev, thumbnailImage: validateThumbnailFile(file) }));
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData(INITIAL_FORM);
        setFieldErrors(INITIAL_ERRORS);
    };

    const runAllValidations = (data) => ({
        year:           validateYear(data.year),
        title:          validateTitle(data.title),
        description:    validateDescription(data.description),
        videoUrl:       validateUrl(data.videoUrl, 'Video URL'),
        thumbnailImage: validateThumbnailFile(data.thumbnailImage),
        displayOrder:   validateDisplayOrder(data.displayOrder),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = runAllValidations(formData);
        setFieldErrors(errors);

        const firstError = Object.values(errors).find(err => err);
        if (firstError) {
            Swal.fire({ title: 'Validation Error', text: firstError, icon: 'warning', confirmButtonColor: '#4a2a18' });
            return;
        }

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                submitData.append(key, formData[key]);
            }
        });

        try {
            if (editingItem) {
                await axiosInstance.put(`/api/admin/heritage/highlights/${editingItem.id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({ title: 'Success', text: 'Highlight updated!', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await axiosInstance.post('/api/admin/heritage/highlights', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({ title: 'Success', text: 'Highlight added!', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Submission failed.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try { await axiosInstance.delete(`/api/admin/heritage/highlights/${id}`); fetchData(); }
            catch (error) { console.error(error); }
        }
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
        setFieldErrors(INITIAL_ERRORS);
        const sc = document.querySelector('.admin-content');
        if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const ErrMsg = ({ name }) => fieldErrors[name]
        ? <div className="form-error-message">{fieldErrors[name]}</div>
        : null;

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Past Highlights</h1>
                </div>
                {editingItem && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* ── Form ── */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Modify Highlight' : 'Post New Highlight'}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern">

                        {/* Year / Duration */}
                        <div className={`form-group-modern ${fieldErrors.year ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Year / Duration <span className="required-mark">*</span></label>
                            <input
                                type="text" name="year" value={formData.year}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.year ? 'has-error' : ''}`}
                                placeholder="e.g. August 2015"
                            />
                            <ErrMsg name="year" />
                        </div>

                        {/* Highlight Title */}
                        <div className={`form-group-modern form-span-2 ${fieldErrors.title ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Highlight Title <span className="required-mark">*</span></label>
                            <input
                                type="text" name="title" value={formData.title}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.title ? 'has-error' : ''}`}
                                placeholder="e.g. Royal Shahi Snan"
                            />
                            <ErrMsg name="title" />
                        </div>

                        {/* Description */}
                        <div className={`form-group-modern form-span-3 ${fieldErrors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Description <span className="required-mark">*</span></label>
                            <textarea
                                name="description" value={formData.description}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.description ? 'has-error' : ''}`}
                                placeholder="Brief summary — at least 10 characters..."
                                rows="3"
                            />
                            <ErrMsg name="description" />
                        </div>

                        {/* Video URL */}
                        <div className={`form-group-modern ${fieldErrors.videoUrl ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Video URL <span style={{ fontSize: '0.75rem', color: '#888' }}>(Optional)</span></label>
                            <input
                                type="text" name="videoUrl" value={formData.videoUrl}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.videoUrl ? 'has-error' : ''}`}
                                placeholder="https://www.youtube.com/embed/..."
                            />
                            <ErrMsg name="videoUrl" />
                        </div>

                        {/* Thumbnail Image */}
                        <div className={`form-group-modern ${fieldErrors.thumbnailImage ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Thumbnail Image <span className="required-mark">*</span></label>
                            <input
                                type="file" name="thumbnailImage"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.webp"
                                className={`form-input-modern ${fieldErrors.thumbnailImage ? 'has-error' : ''}`}
                                style={{ padding: '0.4rem' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>Max 10MB (JPG, PNG, WebP)</span>
                            <ErrMsg name="thumbnailImage" />
                        </div>

                        {/* Display Order */}
                        <div className={`form-group-modern ${fieldErrors.displayOrder ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Display Order <span className="required-mark">*</span></label>
                            <input
                                type="number" name="displayOrder" value={formData.displayOrder}
                                onChange={handleInputChange} min="0"
                                className={`form-input-modern ${fieldErrors.displayOrder ? 'has-error' : ''}`}
                            />
                            <ErrMsg name="displayOrder" />
                        </div>

                        {/* Status */}
                        <div className="form-group-modern form-span-3">
                            <label className="form-label-modern">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="form-select-modern">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingItem ? 'Update Highlight' : 'Save Highlight'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">Reset</button>
                    </div>
                </form>
            </div>

            {/* ── Banner ── */}
            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(255, 126, 54, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#ff7e36' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Highlights Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Historical Milestone Archive</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #ff7e36' }}>
                        <div className="m-vals">
                            <span className="digit">{list.length}</span>
                            <span className="lab">Highlights</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="table-wrapper-premium" style={{ marginTop: '20px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Order</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: '800' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{item.year}</div>
                                    </td>
                                    <td>
                                        <span className={`status-pill status-${item.status === 'ACTIVE' ? 'resolved' : 'pending'}`}>{item.status}</span>
                                    </td>
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

export default KumbhHighlightsManagement;
