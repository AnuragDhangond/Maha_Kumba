import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { liveUpdateService } from '../../api/services/liveUpdateService';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';

const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`).replace(/\/$/, '');

const LiveUpdates = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // Auto-detect category based on path OR query param
    const isEssentialPath = location.pathname.includes('essential-services');
    const urlCategory = isEssentialPath ? 'ESSENTIAL_SERVICE' : (queryParams.get('category') || 'LIVE_UPDATE');

    const [updates, setUpdates] = useState([]);
    const [editingUpdate, setEditingUpdate] = useState(null);
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        featured: false,
        imagePath: '',
        category: urlCategory,
        externalLink: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const entriesPerPage = 10;

    // Backend filtering and pagination: fetch updates when search term, category or page changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUpdates(searchTerm, currentPage, urlCategory);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, urlCategory]);

    // Reset to page 1 when searching or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, urlCategory]);

    const fetchUpdates = async (search = '', page = 1, category = '') => {
        try {
            // Backend uses 0-based indexing for pages
            const response = await liveUpdateService.getAllUpdates(search, category, page - 1, entriesPerPage);
            const data = response.data;

            if (data && data.content !== undefined) {
                setUpdates(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                // Fallback if backend returns simple list
                const list = Array.isArray(data) ? data : [];
                setUpdates(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (error) {
            console.error("Error fetching updates:", error);
            setUpdates([
                { id: 1, title: 'Kumbh Mela Preparations', description: 'Ghat cleaning in progress.', location: 'Ram Kund', startTime: '10:00', endTime: '12:00', featured: true },
                { id: 2, title: 'Ritual Timings', description: 'Timings announced for Shahi Snan.', location: 'Trimbak', startTime: '06:00', endTime: '08:00', featured: false }
            ]);
            setTotalPages(1);
            setTotalElements(2);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const nextData = { ...prev, [name]: val };
            if (name === 'startTime' && nextData.endTime && val > nextData.endTime) {
                nextData.endTime = val;
            }
            return nextData;
        });

        // Validation for time inputs (no past times)
        if (name === 'startTime' || name === 'endTime') {
            const now = new Date();
            const currentHour = String(now.getHours()).padStart(2, '0');
            const currentMinute = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${currentHour}:${currentMinute}`;
            
            if (value && value < currentTime) {
                setFormErrors(prev => ({
                    ...prev,
                    [name]: `${name === 'startTime' ? 'Start' : 'End'} time cannot be in the past.`
                }));
            } else {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        }

        // Validation: prevent numbers in specific fields
        if (['title', 'location', 'description'].includes(name)) {
            const labelMap = {
                title: 'Event Title',
                location: 'Exact Location',
                description: 'Detailed Description'
            };
            if (/\d/.test(value)) {
                setFormErrors(prev => ({ ...prev, [name]: `${labelMap[name]} should not contain numbers` }));
            } else {
                setFormErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
            }
        } else if (formErrors[name] && name !== 'startTime' && name !== 'endTime') {
            setFormErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (formErrors.image) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.image;
                return newErrors;
            });
        }

        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                setFormErrors(prev => ({ ...prev, image: 'Please select a valid image file.' }));
                e.target.value = null;
                return;
            }
            // Check file size range (1MB - 10MB)
            if (file.size < 1 * 1024 * 1024) {
                setFormErrors(prev => ({ ...prev, image: 'Image size should be at least 1 MB.' }));
                e.target.value = null;
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setFormErrors(prev => ({ ...prev, image: 'Image size should be less than 10 MB.' }));
                e.target.value = null;
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setEditingUpdate(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            startTime: '',
            endTime: '',
            featured: false,
            imagePath: '',
            category: urlCategory,
            externalLink: ''
        });
        setFormErrors({});
        setImagePreview(null);
        setSelectedImage(null);
        // Clear file input if it exists
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final validation check for no numbers
        const errors = {};
        const labelMap = {
            title: 'Event Title',
            location: 'Exact Location',
            description: 'Detailed Description'
        };

        ['title', 'location', 'description'].forEach(field => {
            if (/\d/.test(formData[field])) {
                errors[field] = `${labelMap[field]} should not contain numbers`;
            }
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            Swal.fire({
                title: 'Validation Error',
                text: 'Please remove numbers from the required fields.',
                icon: 'error',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        setFormErrors({});
        
        // submissionData no longer needs auto-date because backend is LocalTime
        const submissionData = { ...formData };

        const data = new FormData();
        data.append('update', JSON.stringify(submissionData));
        if (selectedImage) data.append('image', selectedImage);

        try {
            if (editingUpdate) {
                await liveUpdateService.updateLiveUpdate(editingUpdate.id, data);
            } else {
                await liveUpdateService.createUpdate(data);
            }
            Swal.fire({ title: 'Success', text: editingUpdate ? 'Update modified!' : 'Update published!', icon: 'success', confirmButtonColor: '#4a2a18' });
            resetForm();
            fetchUpdates();
        } catch (error) {
            if (error.response && error.response.data) {
                const responseData = error.response.data;
                if (responseData.errors && typeof responseData.errors === 'object') {
                    setFormErrors(responseData.errors);
                    Swal.fire({
                        title: 'Validation Error',
                        text: responseData.message || 'Please check the form fields.',
                        icon: 'error',
                        confirmButtonColor: '#4a2a18'
                    });
                } else if (responseData.message) {
                    setFormErrors({ general: responseData.message });
                    Swal.fire({
                        title: 'Error',
                        text: responseData.message,
                        icon: 'error',
                        confirmButtonColor: '#4a2a18'
                    });
                } else if (responseData.error) {
                    setFormErrors({ general: responseData.error });
                    Swal.fire({
                        title: 'Error',
                        text: responseData.error,
                        icon: 'error',
                        confirmButtonColor: '#4a2a18'
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Submission failed.',
                        icon: 'error',
                        confirmButtonColor: '#4a2a18'
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Submission failed.',
                    icon: 'error',
                    confirmButtonColor: '#4a2a18'
                });
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#4a2a18' });
        if (result.isConfirmed) {
            try {
                await liveUpdateService.deleteLiveUpdate(id);
                fetchUpdates();
                Swal.fire('Deleted!', 'The update has been removed.', 'success');
            } catch (error) { console.error(error); }
        }
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, category: urlCategory }));
    }, [urlCategory]);

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        try {
            // Handle time-only strings (HH:mm or HH:mm:ss)
            if (timeStr.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
                const parts = timeStr.split(':');
                const h = parseInt(parts[0]);
                const m = parts[1].padStart(2, '0');
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
            }
            // Fallback for full ISO strings
            const date = new Date(timeStr.includes('T') ? timeStr : `1970-01-01T${timeStr}`);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
            return timeStr;
        }
    };

    const openEditForm = (update) => {
        setEditingUpdate(update);
        setFormErrors({});
        setFormData({
            title: update.title,
            description: update.description,
            location: update.location,
            // Handle both HH:mm and YYYY-MM-DDTHH:mm
            startTime: update.startTime?.includes('T') ? update.startTime.substring(11, 16) : update.startTime || '',
            endTime: update.endTime?.includes('T') ? update.endTime.substring(11, 16) : update.endTime || '',
            featured: update.featured || false,
            imagePath: update.imagePath || '',
            category: update.category || 'LIVE_UPDATE',
            externalLink: update.externalLink || ''
        });
        const previewUrl = update.imagePath
            ? `${API_URL}${update.imagePath.startsWith('/') ? '' : '/'}${update.imagePath}`
            : null;
        setImagePreview(previewUrl);
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">
                        {urlCategory === 'ESSENTIAL_SERVICE' ? 'Essential Services Master' : 'Live Updates Master'}
                    </h1>
                </div>
                {editingUpdate && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingUpdate ? 'Update Existing Record' : `Record New ${urlCategory === 'ESSENTIAL_SERVICE' ? 'Service' : 'Update'}`}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${formErrors.title ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Event Title <span className="required-mark">*</span></label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input-modern" required placeholder="Heading of the update" />
                            {formErrors.title && <span className="form-error-message">{formErrors.title}</span>}
                        </div>
                        <div className={`form-group-modern ${formErrors.location ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Exact Location <span className="required-mark">*</span></label>
                            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Ram Kund, Main Ghat" />
                            {formErrors.location && <span className="form-error-message">{formErrors.location}</span>}
                        </div>
                        <div className={`form-group-modern form-span-2 ${formErrors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Detailed Description <span className="required-mark">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-textarea-modern" required placeholder="What is happening currently?" rows="3"></textarea>
                            {formErrors.description && <span className="form-error-message">{formErrors.description}</span>}
                        </div>
                        {urlCategory === 'LIVE_UPDATE' && (
                            <>
                                <div className={`form-group-modern ${formErrors.startTime ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Start Time <span className="required-mark">*</span></label>
                                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required className="form-input-modern" />
                                    {formErrors.startTime && <span className="form-error-message">{formErrors.startTime}</span>}
                                </div>
                                <div className={`form-group-modern ${formErrors.endTime ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">End Time (Estimated) <span className="required-mark">*</span></label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input-modern"
                                        min={formData.startTime}
                                    />
                                    {formErrors.endTime && <span className="form-error-message">{formErrors.endTime}</span>}
                                </div>
                            </>
                        )}

                        {urlCategory === 'ESSENTIAL_SERVICE' && (
                            <div className={`form-group-modern form-span-2 ${formErrors.externalLink ? 'has-error' : ''}`}>
                                <label className="form-label-modern">Destination Link (Learn More)</label>
                                <select
                                    name="externalLink"
                                    value={formData.externalLink}
                                    onChange={handleInputChange}
                                    className="form-select-modern"
                                >
                                    <option value="">None (Static Card)</option>
                                    <option value="/">Home (/)</option>
                                    <option value="/travel">Travel & Stay (/travel)</option>
                                    <option value="/virtual-pooja">Virtual Pooja (/virtual-pooja)</option>
                                    <option value="/health">Health & Safety (/health)</option>
                                    <option value="/heritage">Nashik Heritage (/heritage)</option>
                                    <option value="/shop">Shop (/shop)</option>
                                    <option value="/sustainability">Green Kumbh (/sustainability)</option>
                                    <option value="/crowd-status">Crowd Status (/crowd-status)</option>
                                    <option value="/donate">Donate (/donate)</option>
                                </select>
                                {formErrors.externalLink && <span className="form-error-message">{formErrors.externalLink}</span>}
                            </div>
                        )}

                        <div className={`form-group-modern ${formErrors.image ? 'has-error' : ''}`}>
                            <label className="form-label-modern">
                                {urlCategory === 'ESSENTIAL_SERVICE' ? 'Service Icon / Image' : 'Reference Image'} 
                                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '5px', opacity: 0.7 }}>(1MB - 10MB)</span>
                            </label>
                            <input type="file" onChange={handleFileChange} accept="image/*" className="form-input-modern" />
                            {formErrors.image && <span className="form-error-message">{formErrors.image}</span>}
                        </div>

                        {urlCategory === 'LIVE_UPDATE' && (
                            <div className="form-group-modern" style={{ flexDirection: 'row', alignItems: 'center', height: '100%', paddingTop: '30px' }}>
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <label className="form-label-modern" style={{ marginBottom: 0 }}>Important Updates</label>
                            </div>
                        )}
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingUpdate ? 'Update Entry' : 'Save & Publish Live'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(255, 126, 54, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#ff7e36' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Live Updates Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Real-time Broadcast</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #ff7e36' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Published</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Search updates by Title, Description or Location..."
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
                            <th style={{ width: '100px' }}>Preview</th>
                            <th>Title & Details</th>
                            {urlCategory === 'LIVE_UPDATE' && <th>Timing</th>}
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {updates.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{ width: '70px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: 'var(--admin-table-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {u.imagePath ? (
                                            <img src={`${API_URL}${u.imagePath.startsWith('/') ? '' : '/'}${u.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', opacity: 0.4, color: 'var(--admin-text)' }}>N/A</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', color: 'var(--admin-text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {u.title}
                                        {u.featured && <span className="status-pill status-accepted" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Important</span>}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>{u.description}</p>
                                </td>
                                {urlCategory === 'LIVE_UPDATE' && (
                                    <td>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--admin-text)' }}>
                                            <div style={{ color: '#4caf50' }}>{formatTime(u.startTime)}</div>
                                            <div style={{ color: '#ff5252' }}>⌛ {formatTime(u.endTime)}</div>
                                        </div>
                                    </td>
                                )}
                                <td>
                                    <span style={{ background: 'var(--admin-sidebar-hover)', color: 'var(--admin-accent)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' }}>
                                        {u.location}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-actions-modern">
                                        <button onClick={() => openEditForm(u)} className="btn-edit-modern">Edit</button>
                                        <button onClick={() => handleDelete(u.id)} className="btn-delete-modern">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {updates.length === 0 && (
                            <tr>
                                <td colSpan={urlCategory === 'LIVE_UPDATE' ? "5" : "4"} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    No live updates found in the database.
                                </td>
                            </tr>
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

export default LiveUpdates;
