import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import '../../styles/DashboardForms.css';
import { liveUpdateService } from '../../api/services/liveUpdateService';
import homepageConfigService from '../../api/services/homepageConfigService';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
import { Calendar, Save, CheckCircle, AlertCircle, Eye } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`).replace(/\/$/, '');

const OperatorLiveKumbhPage = () => {
    const [activeTab, setActiveTab] = useState('live-updates');
    const location = useLocation();
    const isEssentialPath = location.pathname.includes('essential-services');
    const urlCategory = isEssentialPath ? 'ESSENTIAL_SERVICE' : 'LIVE_UPDATE';

    // ── Live Updates State ──
    const [updates, setUpdates] = useState([]);
    const [editingUpdate, setEditingUpdate] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', location: '', startTime: '', endTime: '',
        featured: false, imagePath: '', category: urlCategory, externalLink: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const entriesPerPage = 10;

    // ── Live Dates State ──
    const [homepageConfig, setHomepageConfig] = useState({ shahiSnanHeading: '', shahiSnanStartDate: '', shahiSnanEndDate: '' });
    const [isConfigSaving, setIsConfigSaving] = useState(false);
    const [configMessage, setConfigMessage] = useState({ text: '', type: '' });

    // Fetch live updates
    useEffect(() => {
        if (activeTab === 'live-updates') {
            const timer = setTimeout(() => { fetchUpdates(searchTerm, currentPage, urlCategory); }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, currentPage, urlCategory, activeTab]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, urlCategory]);

    useEffect(() => {
        if (activeTab === 'live-dates') fetchConfig();
    }, [activeTab]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, category: urlCategory }));
    }, [urlCategory]);

    const fetchUpdates = async (search = '', page = 1, category = '') => {
        try {
            const response = await liveUpdateService.getAllUpdates(search, category, page - 1, entriesPerPage);
            const data = response.data;
            if (data && data.content !== undefined) {
                setUpdates(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                const list = Array.isArray(data) ? data : [];
                setUpdates(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (error) {
            console.error("Error fetching updates:", error);
            setUpdates([]);
            setTotalPages(1);
            setTotalElements(0);
        }
    };

    const fetchConfig = async () => {
        try {
            const config = await homepageConfigService.getConfig();
            setHomepageConfig(config);
        } catch (err) {
            console.error("Error fetching homepage config:", err);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        try {
            if (timeStr.includes(':') && !timeStr.includes('-')) {
                const [hours, minutes] = timeStr.split(':');
                const h = parseInt(hours);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${minutes} ${ampm}`;
            }
            return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
            return timeStr;
        }
    };

    // ── Live Updates Handlers ──
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setFormData(prev => {
            const next = { ...prev, [name]: val };
            if (name === 'startTime' && next.endTime && value > next.endTime) next.endTime = value;
            return next;
        });

        let error = '';
        switch (name) {
            case 'title':
                if (!value.trim()) error = 'Title is required';
                else if (value.length < 5 || value.length > 100) error = 'Title must be between 5 and 100 characters';
                else if (!/[a-zA-Z]/.test(value)) error = 'Title must contain at least one letter';
                else if (/[<>]/.test(value)) error = 'HTML tags are not allowed in title';
                break;
            case 'location':
                if (!value.trim()) error = 'Location is required';
                else if (value.length < 3 || value.length > 150) error = 'Location must be between 3 and 150 characters';
                else if (!/^[a-zA-Z0-9, ]+$/.test(value)) error = 'Location can only contain letters, numbers, commas, and spaces';
                else if (!/[a-zA-Z]/.test(value)) error = 'Location must contain at least one letter';
                break;
            case 'description':
                if (!value.trim()) error = 'Description is required';
                else if (value.length < 10 || value.length > 1000) error = 'Description must be between 10 and 1000 characters';
                else if (/[<>]/.test(value)) error = 'HTML tags are not allowed in description';
                else if (value.length >= 10 && (new Set(value).size / value.length < 0.2)) error = 'Description contains too many repeated characters';
                else if (/^[0-9]+$/.test(value)) error = 'Description contains meaningless input (numbers only)';
                else if (/^[^a-zA-Z0-9]+$/.test(value)) error = 'Description contains meaningless input (special characters only)';
                break;
            case 'startTime':
                if (!value) error = 'Start time is required';
                break;
            case 'endTime':
                if (!value) error = 'End time is required';
                else if (formData.startTime && value <= formData.startTime) error = 'End time must be after start time';
                break;
            case 'externalLink':
                if (urlCategory === 'ESSENTIAL_SERVICE' && value) {
                    if (value.length > 500) error = 'External link must not exceed 500 characters';
                    else if (!/^(https?:\/\/.*|\/.*)?$/.test(value)) error = 'External link must be a valid URL (http/https) or a relative path starting with /';
                    else if (/javascript:/i.test(value)) error = 'JavaScript URLs are not allowed';
                }
                break;
            default:
                break;
        }

        if (error) {
            setFormErrors(prev => ({ ...prev, [name]: error }));
        } else {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check for double/multiple extensions (e.g. "image.png.jpg", "file.exe.png")
            const nameParts = file.name.split('.');
            if (nameParts.length > 2) {
                setFormErrors(prev => ({ ...prev, image: 'File has multiple extensions which is not allowed. Please upload a valid image file.' }));
                e.target.value = null;
                return;
            }

            // Only allow PNG, JPEG, JPG, WEBP, SVG
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
            const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
                setFormErrors(prev => ({ ...prev, image: 'Invalid file format. Only JPG, JPEG, PNG, WEBP, and SVG images are allowed.' }));
                e.target.value = null;
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setFormErrors(prev => ({ ...prev, image: 'Image size should be less than 2 MB.' }));
                e.target.value = null;
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            
            if (formErrors.image) {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.image;
                    return newErrors;
                });
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title || !formData.title.trim()) errors.title = 'Title is required';
        if (!formData.location || !formData.location.trim()) errors.location = 'Location is required';
        if (!formData.description || !formData.description.trim()) errors.description = 'Description is required';
        
        if (urlCategory === 'LIVE_UPDATE') {
            if (!formData.startTime) errors.startTime = 'Start time is required';
            if (!formData.endTime) errors.endTime = 'End time is required';
            if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
                errors.endTime = 'End time must be after start time';
            }
        }
        return errors;
    };

    const resetForm = () => {
        setEditingUpdate(null);
        setFormData({ title: '', description: '', location: '', startTime: '', endTime: '', featured: false, imagePath: '', category: urlCategory, externalLink: '' });
        setFormErrors({});
        setImagePreview(null);
        setSelectedImage(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (formErrors.image) errors.image = formErrors.image;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            Swal.fire({ title: 'Validation Error', text: 'Please check the form fields.', icon: 'error', confirmButtonColor: '#4a2a18' });
            return;
        }

        setFormErrors({});
        const data = new FormData();
        data.append('update', JSON.stringify(formData));
        if (selectedImage) data.append('image', selectedImage);
        try {
            if (editingUpdate) { await liveUpdateService.updateLiveUpdate(editingUpdate.id, data); }
            else { await liveUpdateService.createUpdate(data); }
            Swal.fire({ title: 'Success', text: editingUpdate ? 'Update modified!' : 'Update published!', icon: 'success', confirmButtonColor: '#4a2a18' });
            resetForm();
            fetchUpdates();
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Submission failed.', icon: 'error', confirmButtonColor: '#4a2a18' });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#4a2a18' });
        if (result.isConfirmed) {
            try { await liveUpdateService.deleteLiveUpdate(id); fetchUpdates(); Swal.fire('Deleted!', 'The update has been removed.', 'success'); }
            catch (error) { console.error(error); }
        }
    };

    const openEditForm = (update) => {
        setEditingUpdate(update);
        setFormErrors({});
        setFormData({
            title: update.title, description: update.description, location: update.location,
            startTime: update.startTime?.includes('T') ? update.startTime.substring(11, 16) : update.startTime || '',
            endTime: update.endTime?.includes('T') ? update.endTime.substring(11, 16) : update.endTime || '',
            featured: update.featured || false, imagePath: update.imagePath || '',
            category: update.category || 'LIVE_UPDATE', externalLink: update.externalLink || ''
        });
        setImagePreview(update.imagePath ? (update.imagePath.startsWith('http') ? update.imagePath : `${API_URL}${update.imagePath.startsWith('/') ? '' : '/'}${update.imagePath}`) : null);
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Live Dates Handlers ──
    const handleConfigChange = (e) => {
        setHomepageConfig({ ...homepageConfig, [e.target.name]: e.target.value });
    };

    const saveHomepageConfig = async () => {
        setIsConfigSaving(true);
        try {
            await homepageConfigService.updateConfig(homepageConfig);
            setConfigMessage({ text: 'Dates updated successfully!', type: 'success' });
            setTimeout(() => setConfigMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setConfigMessage({ text: 'Failed to update dates.', type: 'error' });
        } finally { setIsConfigSaving(false); }
    };
    const handlePreviewImage = (imagePath) => {
        if (!imagePath) return;
        const imageUrl = imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
        Swal.fire({
            imageUrl: imageUrl,
            imageAlt: 'Preview Image',
            confirmButtonColor: '#4a2a18',
            confirmButtonText: 'Close',
            background: '#ffffff',
            borderRadius: '16px'
        });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Live Kumbh Updates Hub</h1>
                </div>
            </div>

            <div className="admin-tabs-scrollable">
                <button onClick={() => setActiveTab('live-updates')} className={`tab-btn ${activeTab === 'live-updates' ? 'active' : ''}`}>📡 Live Updates</button>
                <button onClick={() => setActiveTab('live-dates')} className={`tab-btn ${activeTab === 'live-dates' ? 'active' : ''}`}>Live Dates</button>
            </div>

            {activeTab === 'live-updates' ? (
                <>
                    {editingUpdate && (
                        <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                            <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                        </div>
                    )}
                    <div className="dashboard-form-container">
                        <div className="form-header-modern">
                            <h3>{editingUpdate ? 'Update Existing Record' : `Record New ${urlCategory === 'ESSENTIAL_SERVICE' ? 'Service' : 'Update'}`}</h3>
                        </div>
                        <form noValidate onSubmit={handleSubmit}>
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
                                            <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required className="form-input-modern" min={formData.startTime} />
                                            {formErrors.endTime && <span className="form-error-message">{formErrors.endTime}</span>}
                                        </div>
                                    </>
                                )}
                                <div className={`form-group-modern ${formErrors.image ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">{urlCategory === 'ESSENTIAL_SERVICE' ? 'Service Icon / Image' : 'Reference Image'}</label>
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="form-input-modern" />
                                    {formErrors.image && <span className="form-error-message">{formErrors.image}</span>}
                                </div>
                                {urlCategory === 'LIVE_UPDATE' && (
                                    <div className="form-group-modern" style={{ flexDirection: 'row', alignItems: 'center', height: '100%', paddingTop: '30px' }}>
                                        <input type="checkbox" name="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                        <label className="form-label-modern" style={{ marginBottom: 0 }}>Important Updates</label>
                                    </div>
                                )}
                            </div>
                            <div className="form-actions-modern">
                                <button type="submit" className="btn-dashboard-primary">{editingUpdate ? 'Update Entry' : 'Save & Publish Live'}</button>
                                <button type="button" onClick={resetForm} className="btn-dashboard-secondary">Reset</button>
                            </div>
                        </form>
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
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    {u.imagePath ? (
                                                        <div 
                                                            onClick={() => handlePreviewImage(u.imagePath)}
                                                            className="image-preview-container-premium"
                                                            title="Click to view full image"
                                                        >
                                                            <img 
                                                                src={u.imagePath.startsWith('http') ? u.imagePath : `${API_URL}${u.imagePath.startsWith('/') ? '' : '/'}${u.imagePath}`} 
                                                                alt="" 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                            />
                                                            <div className="image-preview-overlay-premium">
                                                                <Eye size={16} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            style={{ 
                                                                width: '70px', 
                                                                height: '50px', 
                                                                borderRadius: '8px', 
                                                                background: 'var(--admin-table-bg)', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'center',
                                                                border: '1px solid rgba(0,0,0,0.05)'
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>N/A</span>
                                                        </div>
                                                    )}
                                                    {u.imagePath && (
                                                        <button 
                                                            onClick={() => handlePreviewImage(u.imagePath)}
                                                            title="View full image"
                                                            style={{ 
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'var(--mahakumbh-orange, #f47b2b)', 
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'transform 0.2s',
                                                                marginTop: '2px'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {u.title}
                                                    {u.featured && <span className="status-pill status-accepted" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Important</span>}
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>{u.description}</p>
                                            </td>
                                            {urlCategory === 'LIVE_UPDATE' && (
                                                <td>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                                                        <div style={{ color: '#4caf50' }}>{formatTime(u.startTime)}</div>
                                                        <div style={{ color: '#ff5252' }}>⌛ {formatTime(u.endTime)}</div>
                                                    </div>
                                                </td>
                                            )}
                                            <td><span style={{ background: 'var(--admin-sidebar-hover)', color: 'var(--admin-accent)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' }}>{u.location}</span></td>
                                            <td>
                                                <div className="table-actions-modern">
                                                    <button onClick={() => openEditForm(u)} className="btn-edit-modern">Edit</button>
                                                    <button onClick={() => handleDelete(u.id)} className="btn-delete-modern">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
                    <h3>Dates Configuration</h3>
                    {/* Simplified for revert space */}
                </div>
            )}
        </div>
    );
};

export default OperatorLiveKumbhPage;
