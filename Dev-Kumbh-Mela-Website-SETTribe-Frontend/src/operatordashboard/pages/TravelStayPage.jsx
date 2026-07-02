import React, { useState, useEffect, useRef } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { stayService } from '../../api/services/stayService';
import axiosInstance from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';
import { travelGroupService } from '../../api/services/travelGroupService';
import { Users, Trash2, Eye, MapPin, Calendar, Train, ShieldAlert, X } from 'lucide-react';

const TravelStayPage = () => {
    const formRef = useRef(null);
    const titleInputRef = useRef(null);
    const [stays, setStays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStay, setEditingStay] = useState(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Premium Hotels',
        rating: '',
        price: '',
        features: '',
        navigationLink: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');

    // Travel Circles admin states
    const [activeSection, setActiveSection] = useState('stays');
    const [travelGroups, setTravelGroups] = useState([]);
    const [searchGroupQuery, setSearchGroupQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const entriesPerPage = 10;

    // Backend filtering and pagination: fetch stays when search term or page changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStays(searchTerm, currentPage);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchOperatorGroups = async (search = '') => {
        setIsLoadingGroups(true);
        try {
            const res = await travelGroupService.getTravelGroups(search, '');
            setTravelGroups(res.data || []);
        } catch (err) {
            console.error("Error fetching operator groups:", err);
            setTravelGroups([]);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'circles') {
            const timer = setTimeout(() => {
                fetchOperatorGroups(searchGroupQuery);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeSection, searchGroupQuery]);

    const handleDeleteGroup = async (groupId) => {
        const result = await Swal.fire({
            title: 'Delete Travel Circle?',
            text: 'This will permanently delete the group and remove all registered members.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff5252',
            confirmButtonText: 'Yes, Delete it'
        });
        if (result.isConfirmed) {
            try {
                await travelGroupService.deleteTravelGroup(groupId);
                Swal.fire('Deleted', 'The travel group has been removed.', 'success');
                fetchOperatorGroups(searchGroupQuery);
            } catch (err) {
                Swal.fire('Error', 'Failed to delete the group.', 'error');
            }
        }
    };

    const handleViewMembers = async (group) => {
        if (selectedGroup && selectedGroup.id === group.id) {
            setSelectedGroup(null);
            setShowMembersModal(false);
            return;
        }
        setSelectedGroup(group);
        try {
            const res = await travelGroupService.getTravelGroupMembers(group.id);
            setGroupMembers(res.data || []);
        } catch (err) {
            Swal.fire('Error', 'Failed to retrieve members list.', 'error');
        }
    };

    useEffect(() => {
        if (!editingStay) {
            return undefined;
        }

        const frameId = window.requestAnimationFrame(() => {
            const formElement = formRef.current;
            if (!formElement) {
                return;
            }

            const scrollContainer = formElement.closest('.admin-content');
            if (scrollContainer) {
                const containerTop = scrollContainer.getBoundingClientRect().top;
                const formTop = formElement.getBoundingClientRect().top;
                const targetTop = scrollContainer.scrollTop + (formTop - containerTop) - 16;

                scrollContainer.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior: 'smooth'
                });
            } else {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            titleInputRef.current?.focus();
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [editingStay]);

    const fetchStays = async (search = '', page = 1) => {
        setIsLoading(true);
        try {
            setError('');
            const response = await stayService.getStays(search, page - 1, entriesPerPage);
            const data = response.data;
            
            if (data && data.content !== undefined) {
                setStays(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                const list = Array.isArray(data) ? data : [];
                setStays(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (fetchError) {
            console.error('Error fetching stays:', fetchError);
            setError('Unable to load accommodations from the backend.');
            setStays([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        let error = '';
        switch (name) {
            case 'title':
                if (!value.trim()) error = 'Stay title is required';
                else if (value.length < 5 || value.length > 120) error = 'Title must be between 5 and 120 characters';
                else if (!/[a-zA-Z0-9]/.test(value)) error = 'Title must contain at least one letter or number';
                break;
            case 'rating':
                const ratingVal = parseFloat(value);
                if (!value) error = 'Rating is required';
                else if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) error = 'Rating must be between 0 and 5';
                else if (!/^([0-4](\.\d)?|5(\.0)?)$/.test(value)) error = 'Rating must be between 0.0 and 5.0 with max 1 decimal place';
                break;
            case 'price':
                if (!value) error = 'Price is required';
                else if (!/^([0-9]{1,5}|100000)$/.test(value)) error = 'Price must be a number between 0 and 100,000';
                break;
            case 'category':
                if (!value) error = 'Category is required';
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

            // Only allow PNG and JPEG
            const allowedTypes = ['image/jpeg', 'image/png'];
            const allowedExtensions = ['.jpg', '.jpeg', '.png'];
            const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
                setFormErrors(prev => ({ ...prev, image: 'Invalid file format. Only PNG and JPEG images are allowed.' }));
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
            setRemoveExistingImage(false);
            
            if (formErrors.image) {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.image;
                    return newErrors;
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});

        // Frontend validation for rating
        const ratingVal = parseFloat(formData.rating);
        if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
            setFormErrors(prev => ({ ...prev, rating: 'Rating must be between 0 and 5' }));
            return;
        }

        const data = new FormData();
        const featuresList = formData.features ? formData.features.split(',').map((feature) => feature.trim()).filter((feature) => feature !== '') : [];
        const stayObj = {
            title: formData.title,
            category: formData.category,
            rating: formData.rating,
            price: formData.price,
            features: featuresList,
            navigationLink: formData.navigationLink,
            removeImage: removeExistingImage
        };
        data.append('stay', JSON.stringify(stayObj));
        if (selectedImage) data.append('image', selectedImage);

        try {
            if (editingStay) {
                await stayService.updateStay(editingStay.id, data);
            } else {
                await stayService.createStay(data);
            }
            Swal.fire({ title: 'Success', text: 'Stay record saved.', icon: 'success', confirmButtonColor: '#4a2a18' });
            resetForm();
            
            // Reset filters to ensure the new record is visible on the first page
            setSearchTerm('');
            setCurrentPage(1);
            
            // If we were already on page 1 with no search, the useEffect won't trigger, 
            // so we perform a manual fetch to refresh the data.
            if (searchTerm === '' && currentPage === 1) {
                fetchStays('', 1);
            }
        } catch (submitError) {
            if (submitError.response && submitError.response.data) {
                const errors = submitError.response.data;
                if (typeof errors === 'object') {
                    if (errors.error) {
                        Swal.fire('Error', errors.error, 'error');
                    } else {
                        setFormErrors(errors);
                    }
                } else {
                    Swal.fire('Error', errors || 'Submission failed.', 'error');
                }
            } else {
                Swal.fire('Error', 'Submission failed.', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try {
                await stayService.deleteStay(id);
                fetchStays();
            } catch (deleteError) {
                console.error(deleteError);
            }
        }
    };

    const openEditForm = (stay) => {
        setEditingStay(stay);
        setFormData({
            title: stay.title,
            category: stay.category,
            rating: stay.rating,
            price: stay.price,
            features: stay.features ? stay.features.join(', ') : '',
            navigationLink: stay.navigationLink || ''
        });
        setImagePreview(stay.imagePath ? `${axiosInstance.defaults.baseURL || ''}${stay.imagePath}` : null);
        setValidated(false);
        setFormErrors({});
    };

    const resetForm = () => {
        setEditingStay(null);
        setFormData({ 
            title: '', 
            category: 'Premium Hotels', 
            rating: '', 
            price: '', 
            features: '',
            navigationLink: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
        setValidated(false);
        setRemoveExistingImage(false);
        setFormErrors({});
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '25px' }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Travel & Stay Management</h1>
                </div>
                {activeSection === 'stays' && editingStay && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            <div className="admin-tabs-scrollable" style={{ marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveSection('stays')} 
                    className={`tab-btn ${activeSection === 'stays' ? 'active' : ''}`}
                >
                    🏨 Stays Registry
                </button>
                <button 
                    onClick={() => setActiveSection('circles')} 
                    className={`tab-btn ${activeSection === 'circles' ? 'active' : ''}`}
                >
                    🤝 Co-Traveller Circles
                </button>
            </div>

            {activeSection === 'stays' ? (
                <>
                    {/* Management Form */}
                    <div ref={formRef} className="dashboard-form-container">
                        <div className="form-header-modern">
                            <h3>{editingStay ? 'Modify Stay Record' : 'Register New Accommodation'}</h3>
                        </div>
                        <form noValidate onSubmit={handleSubmit}>
                            <div className="form-grid-modern">
                                <div className={`form-group-modern form-span-2 ${formErrors.title ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Stay Title <span className="required-mark">*</span></label>
                                    <input ref={titleInputRef} type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Gateway Hotel Nashik" />
                                    {formErrors.title && <span className="form-error-message">{formErrors.title}</span>}
                                </div>
                                <div className={`form-group-modern ${formErrors.category ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Category <span className="required-mark">*</span></label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="form-select-modern" required>
                                        <option value="Premium Hotels">Premium Hotels</option>
                                        <option value="Traditional Ashrams">Traditional Ashrams</option>
                                        <option value="Luxury Tents">Luxury Tents</option>
                                        <option value="Heritage Homestays">Heritage Homestays</option>
                                    </select>
                                    {formErrors.category && <span className="form-error-message">{formErrors.category}</span>}
                                </div>
                                <div className={`form-group-modern ${formErrors.rating ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Rating <span className="required-mark">*</span></label>
                                    <input 
                                        type="text" 
                                        name="rating" 
                                        value={formData.rating} 
                                        onChange={handleInputChange} 
                                        className="form-input-modern" 
                                        required 
                                        min="0" 
                                        max="5" 
                                        step="0.1"
                                        placeholder="Rating (0-5)" 
                                    />
                                    {formErrors.rating && <span className="form-error-message">{formErrors.rating}</span>}
                                </div>
                                <div className={`form-group-modern ${formErrors.price ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Price (per night) <span className="required-mark">*</span></label>
                                    <input type="text" name="price" value={formData.price} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. 4500" />
                                    {formErrors.price && <span className="form-error-message">{formErrors.price}</span>}
                                </div>
                                <div className={`form-group-modern ${formErrors.image ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Visual Photo</label>
                                    <input type="file" onChange={handleFileChange} accept=".png,.jpg,.jpeg" className="form-input-modern" />
                                    {formErrors.image && <span className="form-error-message">{formErrors.image}</span>}
                                </div>
                                <div className="form-group-modern form-span-2">
                                    <label className="form-label-modern">Navigation Link (Google Maps/Booking URL)</label>
                                    <input type="url" name="navigationLink" value={formData.navigationLink} onChange={handleInputChange} className="form-input-modern" placeholder="https://maps.google.com/..." />
                                </div>
                                <div className="form-group-modern form-span-3">
                                    <label className="form-label-modern">Key Features (Comma separated)</label>
                                    <input type="text" name="features" value={formData.features} onChange={handleInputChange} className="form-input-modern" placeholder="e.g. Free Wifi, A/C, Breakfast" />
                                </div>
                            </div>
                            <div className="form-actions-modern">
                                <button type="submit" className="btn-dashboard-primary">
                                    {editingStay ? 'Update Registration' : 'Register Stay & Travel'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="emergency-banner-static" style={{ marginTop: '40px' }}>
                        <div className="banner-context">
                            <div className="static-marker-sos" style={{ background: 'rgba(33, 150, 243, 0.08)' }}>
                                <div className="marker-inner" style={{ background: '#2196F3' }}></div>
                            </div>
                            <div>
                                <h2 className="title-static">Accommodations Registry</h2>
                                <span className="subtitle-static">Official travel directory</span>
                            </div>
                        </div>
                        <div className="banner-metrics-static">
                            <div className="metric-box-fixed" style={{ borderBottom: '3px solid #2196F3' }}>
                                <div className="m-vals">
                                    <span className="digit">{totalElements}</span>
                                    <span className="lab">Registered</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Search accommodations by Title, Category or Features..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input-modern"
                            style={{ width: '100%', maxWidth: 'none' }}
                        />
                    </div>

                    {error && (
                        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#fff1f2', color: '#be123c' }}>
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <div className="text-center">
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⌛</div>
                                <h3>Updating List...</h3>
                            </div>
                        </div>
                    ) : (
                        <div className="table-wrapper-premium" style={{ marginTop: '20px' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '100px' }}>Preview</th>
                                            <th>Stay Details</th>
                                            <th>Price & Rating</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stays.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                                    No accommodations found matching your search.
                                                </td>
                                            </tr>
                                        ) : (
                                            stays.map((stay) => (
                                                <tr key={stay.id}>
                                                    <td>
                                                        <div style={{ width: '70px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                             {stay.imagePath ? (
                                                                <img src={stay.imagePath.startsWith('http') ? stay.imagePath : `${axiosInstance.defaults.baseURL || ''}${stay.imagePath.startsWith('/') ? '' : '/'}${stay.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <span style={{ fontSize: '1rem' }}>Stay</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '800', color: 'var(--admin-text)' }}>{stay.title}</div>
                                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                            <span className="status-pill status-accepted" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{stay.category}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>{stay.features && stay.features.join(' | ')}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '800', color: '#ff7e36' }}>Rs {stay.price}</div>
                                                        <div style={{ fontSize: '0.85rem' }}>Rating {stay.rating}/5</div>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions-modern">
                                                            <button onClick={() => openEditForm(stay)} className="btn-edit-modern">Edit</button>
                                                            <button onClick={() => handleDelete(stay.id)} className="btn-delete-modern">Delete</button>
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
                    )}
                </>
            ) : (
                <>
                    <div className="emergency-banner-static" style={{ marginTop: '10px' }}>
                        <div className="banner-context">
                            <div className="static-marker-sos" style={{ background: 'rgba(230, 92, 0, 0.08)' }}>
                                <div className="marker-inner" style={{ background: '#e65c00' }}></div>
                            </div>
                            <div>
                                <h2 className="title-static">Co-Traveller Circles Directory</h2>
                                <span className="subtitle-static">Pilgrim-led travel coordination</span>
                            </div>
                        </div>
                        <div className="banner-metrics-static">
                            <div className="metric-box-fixed" style={{ borderBottom: '3px solid #e65c00' }}>
                                <div className="m-vals">
                                    <span className="digit">{travelGroups.length}</span>
                                    <span className="lab">Active Circles</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="Search active travel circles by Origin City..." 
                            value={searchGroupQuery}
                            onChange={(e) => setSearchGroupQuery(e.target.value)}
                            className="form-input-modern"
                            style={{ width: '100%', maxWidth: 'none' }}
                        />
                    </div>

                    {isLoadingGroups ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className="spiritual-loader"></div>
                                <h3 style={{ marginTop: '15px' }}>Loading Travel Circles...</h3>
                            </div>
                        </div>
                    ) : (
                        <div className="table-wrapper-premium" style={{ marginTop: '10px' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Group Name</th>
                                            <th>Join Code</th>
                                            <th>Route & Schedule</th>
                                            <th>Capacity & Mode</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {travelGroups.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                                    No active travel groups found.
                                                </td>
                                            </tr>
                                        ) : (
                                            travelGroups.map((group) => {
                                                const percentage = Math.min(100, Math.round(((group.membersCount || 1) / (group.maxMembers || 10)) * 100));
                                                return (
                                                    <React.Fragment key={group.id}>
                                                        <tr>
                                                            <td>
                                                                <div style={{ fontWeight: '800', color: 'var(--admin-text)' }}>{group.groupName}</div>
                                                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>Hosted by: {group.creatorName || 'Anonymous'}</div>
                                                            </td>
                                                            <td>
                                                                <span style={{ background: '#FFF3E0', color: '#e65c00', border: '1px dashed #ff7e36', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                                    {group.groupCode}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <MapPin size={14} color="#ff7e36"/>
                                                                    {group.sourceLocation} → Nashik
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <Calendar size={14} color="#ff7e36"/>
                                                                    {new Date(group.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                                                    <span>{group.travelMode || 'Train'}</span>
                                                                    <span>{group.membersCount || 1} / {group.maxMembers || 10}</span>
                                                                </div>
                                                                <div style={{ width: '120px', height: '6px', background: '#eceff1', borderRadius: '10px', overflow: 'hidden' }}>
                                                                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #ff7e36, #e65c00)', width: `${percentage}%` }}></div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="table-actions-modern">
                                                                    <button onClick={() => handleViewMembers(group)} className="btn-edit-modern" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                        {selectedGroup?.id === group.id ? <X size={14} /> : <Eye size={14}/>} {selectedGroup?.id === group.id ? 'Close' : 'Members'}
                                                                    </button>
                                                                    <button onClick={() => handleDeleteGroup(group.id)} className="btn-delete-modern" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                        <Trash2 size={14}/> Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {selectedGroup?.id === group.id && (
                                                            <tr>
                                                                <td colSpan="5" style={{ padding: '0', background: '#fdfaf2' }}>
                                                                    <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                                            <h4 style={{ fontFamily: 'Cinzel, serif', color: '#4a2a18', margin: 0, fontSize: '1.1rem' }}>Registered Members ({groupMembers.length})</h4>
                                                                        </div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                                                                            {groupMembers.length === 0 ? (
                                                                                <p style={{ color: '#795d4d' }}>No members registered yet.</p>
                                                                            ) : (
                                                                                groupMembers.map((member, i) => (
                                                                                    <div key={member.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: 'white', borderRadius: '8px', border: '1px solid rgba(74,42,24,0.1)' }}>
                                                                                        <div>
                                                                                            <div style={{ fontWeight: 'bold', color: '#4a2a18' }}>{member.memberName}</div>
                                                                                            {member.memberPhone && <div style={{ fontSize: '0.8rem', color: '#795d4d', marginTop: '4px' }}>📞 {member.memberPhone}</div>}
                                                                                        </div>
                                                                                        <div style={{ fontSize: '0.8rem', color: '#9e9e9e', display: 'flex', alignItems: 'center' }}>
                                                                                            Joined {new Date(member.joinedAt || member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default TravelStayPage;
