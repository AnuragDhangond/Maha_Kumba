import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Swal from 'sweetalert2';
import '../../../styles/DashboardForms.css';

// ── Validators ────────────────────────────────────────────────────────────────

const validateTitle = (v) => {
    if (!v || !v.trim()) return 'Page Title is required';
    if (/^\d+$/.test(v.trim())) return 'Page Title cannot be only numbers';
    if (v.trim().length < 2) return 'Page Title must be at least 2 characters';
    if (v.trim().length > 150) return 'Page Title cannot exceed 150 characters';
    if (!/^[a-zA-Z0-9\s.,'\-!?&()/:]+$/.test(v.trim())) return 'Page Title contains invalid characters';
    return '';
};

const validateHeading = (v, label) => {
    if (!v || !v.trim()) return `${label} is required`;
    if (/^\d+$/.test(v.trim())) return `${label} cannot be only numbers`;
    if (v.trim().length < 2) return `${label} must be at least 2 characters`;
    if (v.trim().length > 200) return `${label} cannot exceed 200 characters`;
    if (!/^[a-zA-Z0-9\s.,'\-!?&()/:]+$/.test(v.trim())) return `${label} contains invalid characters`;
    return '';
};

const validateUrl = (v, label) => {
    if (!v || !v.trim()) return '';                      // optional
    try { new URL(v.trim()); return ''; } catch {
        return `${label} must be a valid URL (e.g. https://...)`;
    }
};

const validateParagraph = (v, label) => {
    if (!v || !v.trim()) return `${label} is required`;
    if (/^\d+$/.test(v.trim())) return `${label} cannot be only numbers`;
    if (v.trim().length < 10) return `${label} must be at least 10 characters`;
    if (v.trim().length > 5000) return `${label} cannot exceed 5000 characters`;
    return '';
};

const INITIAL_ERRORS = {
    title: '', subtitle: '', heading: '',
    videoUrl: '', backgroundImage: '',
    paragraph1: '', paragraph2: ''
};

const INITIAL_FORM = {
    title: '', subtitle: '', videoUrl: '',
    heading: '', paragraph1: '', paragraph2: '',
    backgroundImage: '', status: 'ACTIVE'
};

// ── Component ─────────────────────────────────────────────────────────────────

const HeritageHistoryManagement = () => {
    const [historyList, setHistoryList] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState(INITIAL_ERRORS);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    useEffect(() => { fetchHistory(); }, [currentPage]);

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/heritage/history', {
                params: { page: currentPage - 1, size: entriesPerPage }
            });
            if (res.data && res.data.content !== undefined) {
                setHistoryList(res.data.content);
            } else {
                setHistoryList(Array.isArray(res.data) ? res.data : []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            setHistoryList([{ id: 1, title: 'Nashik Heritage', heading: 'History of Kumbh', status: 'ACTIVE' }]);
        }
    };

    // Real-time validation on every keystroke
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        let err = '';
        switch (name) {
            case 'title':           err = validateTitle(value); break;
            case 'subtitle':        err = validateHeading(value, 'Subtitle'); break;
            case 'heading':         err = validateHeading(value, 'Section Heading'); break;
            case 'videoUrl':        err = validateUrl(value, 'Video URL'); break;
            case 'backgroundImage': err = validateUrl(value, 'Background Image URL'); break;
            case 'paragraph1':      err = validateParagraph(value, 'Paragraph 1'); break;
            case 'paragraph2':      err = validateParagraph(value, 'Paragraph 2'); break;
            default: break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: err }));
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData(INITIAL_FORM);
        setFieldErrors(INITIAL_ERRORS);
    };

    const runAllValidations = (data) => ({
        title:           validateTitle(data.title),
        subtitle:        validateHeading(data.subtitle, 'Subtitle'),
        heading:         validateHeading(data.heading, 'Section Heading'),
        videoUrl:        validateUrl(data.videoUrl, 'Video URL'),
        backgroundImage: validateUrl(data.backgroundImage, 'Background Image URL'),
        paragraph1:      validateParagraph(data.paragraph1, 'Paragraph 1'),
        paragraph2:      validateParagraph(data.paragraph2, 'Paragraph 2'),
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

        try {
            if (editingItem) {
                await axiosInstance.put(`/api/admin/heritage/history/${editingItem.id}`, formData);
                Swal.fire({ title: 'Success', text: 'History updated!', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await axiosInstance.post('/api/admin/heritage/history', formData);
                Swal.fire({ title: 'Success', text: 'History added!', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchHistory();
        } catch (error) {
            Swal.fire('Error', 'Failed to save record.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try { await axiosInstance.delete(`/api/admin/heritage/history/${id}`); fetchHistory(); }
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

    // Helper to render an error message row
    const ErrMsg = ({ name }) => fieldErrors[name]
        ? <div className="form-error-message">{fieldErrors[name]}</div>
        : null;

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Kumbh History</h1>
                </div>
                {editingItem && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* ── Form ── */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Modify History Record' : 'Add New History Content'}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern">

                        {/* Page Title */}
                        <div className={`form-group-modern ${fieldErrors.title ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Page Title <span className="required-mark">*</span></label>
                            <input
                                type="text" name="title" value={formData.title}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.title ? 'has-error' : ''}`}
                                placeholder="e.g. Nashik — City of Faith"
                            />
                            <ErrMsg name="title" />
                        </div>

                        {/* Subtitle */}
                        <div className={`form-group-modern ${fieldErrors.subtitle ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Subtitle <span className="required-mark">*</span></label>
                            <input
                                type="text" name="subtitle" value={formData.subtitle}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.subtitle ? 'has-error' : ''}`}
                                placeholder="e.g. A heritage spanning 2000 years"
                            />
                            <ErrMsg name="subtitle" />
                        </div>

                        {/* Section Heading */}
                        <div className={`form-group-modern ${fieldErrors.heading ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Section Heading <span className="required-mark">*</span></label>
                            <input
                                type="text" name="heading" value={formData.heading}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.heading ? 'has-error' : ''}`}
                                placeholder="e.g. The Sacred Godavari River"
                            />
                            <ErrMsg name="heading" />
                        </div>

                        {/* Video Embed URL */}
                        <div className={`form-group-modern ${fieldErrors.videoUrl ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Video Embed URL</label>
                            <input
                                type="text" name="videoUrl" value={formData.videoUrl}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.videoUrl ? 'has-error' : ''}`}
                                placeholder="https://www.youtube.com/embed/..."
                            />
                            <ErrMsg name="videoUrl" />
                        </div>

                        {/* Background Image URL */}
                        <div className={`form-group-modern ${fieldErrors.backgroundImage ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Background Image URL</label>
                            <input
                                type="text" name="backgroundImage" value={formData.backgroundImage}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.backgroundImage ? 'has-error' : ''}`}
                                placeholder="https://..."
                            />
                            <ErrMsg name="backgroundImage" />
                        </div>

                        {/* Status */}
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="form-select-modern">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        {/* Paragraph 1 */}
                        <div className={`form-group-modern form-span-3 ${fieldErrors.paragraph1 ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Paragraph 1 <span className="required-mark">*</span></label>
                            <textarea
                                name="paragraph1" value={formData.paragraph1}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.paragraph1 ? 'has-error' : ''}`}
                                placeholder="Primary content — at least 10 characters..."
                                rows="3"
                            />
                            <ErrMsg name="paragraph1" />
                        </div>

                        {/* Paragraph 2 */}
                        <div className={`form-group-modern form-span-3 ${fieldErrors.paragraph2 ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Paragraph 2 <span className="required-mark">*</span></label>
                            <textarea
                                name="paragraph2" value={formData.paragraph2}
                                onChange={handleInputChange}
                                className={`form-input-modern ${fieldErrors.paragraph2 ? 'has-error' : ''}`}
                                placeholder="Secondary content — at least 10 characters..."
                                rows="3"
                            />
                            <ErrMsg name="paragraph2" />
                        </div>
                    </div>

                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingItem ? 'Update Record' : 'Save History Record'}
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
                        <h2 className="title-static">History Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Archival Content Management</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #ff7e36' }}>
                        <div className="m-vals">
                            <span className="digit">{historyList.length}</span>
                            <span className="lab">Records</span>
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
                                <th>Content Details</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyList.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: '800' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{item.heading}</div>
                                    </td>
                                    <td>
                                        <span className={`status-pill status-${item.status === 'ACTIVE' ? 'resolved' : 'pending'}`}>{item.status}</span>
                                    </td>
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
                        <div className="pager-info">Page <strong>{currentPage}</strong> of {Math.ceil(historyList.length / entriesPerPage) || 1}</div>
                        <button className="pager-btn" disabled={currentPage >= Math.ceil(historyList.length / entriesPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeritageHistoryManagement;
