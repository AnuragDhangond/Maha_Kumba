import React, { useState, useEffect, useRef } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { stayService } from '../../api/services/stayService';
import axiosInstance from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';
import useValidation from '../../hooks/useValidation';
import { validateRequired, validateNumber, validateTextLength, validateImage } from '../../utils/validationUtils';
import ValidationError from '../../components/ValidationError';

const TravelStayPage = () => {
    const formRef = useRef(null);
    const titleInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stays, setStays] = useState([]);
    const [editingStay, setEditingStay] = useState(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const validationSchema = {
        title: [
            (v) => validateRequired(v),
            (v) => validateTextLength(v, 5, 120, 'Stay title'),
            (v) => (/[a-zA-Z0-9]/.test(v || '') ? null : 'Stay title must contain at least one letter or number')
        ],
        category: [(v) => validateRequired(v)],
        rating: [
            (v) => validateRequired(v),
            (v) => {
                if (v === null || v === undefined || v === '') return 'Rating is required';
                const rating = Number(v);
                if (Number.isNaN(rating)) return 'Rating must be a number between 1 and 5';
                if (rating < 1 || rating > 5) return 'Rating must be between 1 and 5';
                if (!/^([1-4](\.\d)?|5(\.0)?)$/.test(String(v).trim())) {
                    return 'Rating can have at most one decimal place';
                }
                return null;
            }
        ],
        price: [
            (v) => validateRequired(v),
            (v) => validateNumber(v, { min: 1, max: 100000, allowDecimal: false, fieldName: 'Price' })
        ],
        navigationLink: [
            (v) => {
                if (!v || v.trim() === '') return null;
                const googleMapsRegex = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)/;
                const httpRegex = /^https?:\/\//;
                if (googleMapsRegex.test(v) || httpRegex.test(v)) {
                    return null;
                }
                return 'Please enter a valid Google Maps link or http/https URL';
            }
        ],
        features: [
            (v) => validateTextLength(v, 0, 250, 'Key features')
        ],
        image: [
            (v) => {
                if (!editingStay && !v) return 'Visual Photo is required';
                return validateImage(v, { maxSizeMB: 10 });
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
        title: '',
        category: 'Premium Hotels',
        rating: '',
        price: '',
        features: '',
        navigationLink: '',
        image: null
    }, validationSchema);

    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    useEffect(() => {
        fetchStays();
    }, []);

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

    const fetchStays = async () => {
        try {
            const response = await stayService.getStays();
            setStays(response.data);
        } catch (error) {
            console.error("Error fetching stays:", error);
            // Fallback for demo
            setStays([
                { id: 1, title: 'Gateway Hotel Nashik', category: 'Premium Hotels', rating: '5', price: '4500', features: ['WiFi', 'Pool'] },
                { id: 2, title: 'Nashik Ashram', category: 'Traditional Ashrams', rating: '4', price: '500', features: ['Peaceful', 'Food'] }
            ]);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file || null);
        setFormData(prev => ({ ...prev, image: file || null }));
        setRemoveExistingImage(false);

        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setErrors(prev => {
                const next = { ...prev };
                delete next.image;
                return next;
            });
        } else if (editingStay && editingStay.imagePath) {
            setImagePreview(`${axiosInstance.defaults.baseURL || ''}${editingStay.imagePath}`);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const data = new FormData();
        const featuresList = formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f !== "") : [];
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
            Swal.fire({ title: 'Success!', text: 'Stay record saved.', icon: 'success', confirmButtonColor: '#4a2a18' });
            resetForm();
            fetchStays();
        } catch (error) {
            Swal.fire('Error', 'Submission failed.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#4a2a18' });
        if (result.isConfirmed) {
            try {
                await stayService.deleteStay(id);
                fetchStays();
            } catch (error) { console.error(error); }
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
            navigationLink: stay.navigationLink || '',
            image: null
        });
        setSelectedImage(null);
        setImagePreview(stay.imagePath ? `${axiosInstance.defaults.baseURL || ''}${stay.imagePath}` : null);
        setErrors({});
    };

    const resetForm = () => {
        setEditingStay(null);
        resetValidationForm();
        setSelectedImage(null);
        setRemoveExistingImage(false);
        setErrors({});
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Travel & Stay Registry</h1>
                </div>
                {editingStay && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div ref={formRef} className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingStay ? 'Modify Stay Record' : 'Register New Accommodation'}</h3>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern form-span-2 ${errors.title ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Stay Title <span className="required-mark">*</span></label>
                            <input ref={titleInputRef} type="text" name="title" value={formData.title} onChange={handleChange} className={`form-input-modern ${errors.title ? 'has-error' : ''}`} placeholder="e.g. Gateway Hotel Nashik" />
                            <ValidationError error={errors.title} />
                        </div>
                        <div className={`form-group-modern ${errors.category ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Category <span className="required-mark">*</span></label>
                            <select name="category" value={formData.category} onChange={handleChange} className={`form-select-modern ${errors.category ? 'has-error' : ''}`}>
                                <option value="Premium Hotels">Premium Hotels</option>
                                <option value="Traditional Ashrams">Traditional Ashrams</option>
                                <option value="Luxury Tents">Luxury Tents</option>
                                <option value="Heritage Homestays">Heritage Homestays</option>
                            </select>
                            <ValidationError error={errors.category} />
                        </div>
                        <div className={`form-group-modern ${errors.rating ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Rating <span className="required-mark">*</span></label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                className={`form-input-modern ${errors.rating ? 'has-error' : ''}`}
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="Rating (0-5)"
                            />
                            <ValidationError error={errors.rating} />
                        </div>
                        <div className={`form-group-modern ${errors.price ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Price (per night) <span className="required-mark">*</span></label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className={`form-input-modern ${errors.price ? 'has-error' : ''}`} min="1" max="100000" step="1" placeholder="e.g. 4500" />
                            <ValidationError error={errors.price} />
                        </div>
                        <div className={`form-group-modern ${errors.image ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Visual Photo {!editingStay && <span className="required-mark">*</span>}</label>
                            <input
                                type="file"
                                name="image"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".png,.jpg,.jpeg"
                                className={`form-input-modern ${errors.image ? 'has-error' : ''}`}
                            />
                            <ValidationError error={errors.image} />
                        </div>
                        <div className="form-group-modern form-span-2">
                            <label className="form-label-modern">Navigation Link (Google Maps/Booking URL)</label>
                            <input type="url" name="navigationLink" value={formData.navigationLink} onChange={handleChange} className={`form-input-modern ${errors.navigationLink ? 'has-error' : ''}`} placeholder="https://maps.google.com/..." />
                            <ValidationError error={errors.navigationLink} />
                        </div>
                        <div className="form-group-modern form-span-3">
                            <label className="form-label-modern">Key Features (Comma separated)</label>
                            <input type="text" name="features" value={formData.features} onChange={handleChange} className={`form-input-modern ${errors.features ? 'has-error' : ''}`} placeholder="e.g. Free Wifi, A/C, Breakfast" />
                            <ValidationError error={errors.features} />
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

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(33, 150, 243, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#2196F3' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Accommodations Registry</h2>
                        <span className="subtitle-static">Nashik 2027 • Official Travel Directory</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #2196F3' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{stays.length}</span>
                            <span className="lab">Registered</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper-premium">
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
                        {stays.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map(stay => (
                            <tr key={stay.id}>
                                <td>
                                    <div style={{ width: '70px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {stay.imagePath ? (
                                            <img src={`${axiosInstance.defaults.baseURL || ''}${stay.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '1.5rem' }}></span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', color: 'var(--admin-text)' }}>{stay.title}</div>
                                    <span className="status-pill status-accepted" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{stay.category}</span>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>{stay.features && stay.features.join(' • ')}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', color: 'var(--admin-accent)' }}>₹{stay.price}</div>
                                    <div style={{ fontSize: '0.85rem' }}>{stay.rating}/5</div>
                                </td>
                                <td>
                                    <div className="table-actions-modern">
                                        <button onClick={() => openEditForm(stay)} className="btn-edit-modern">Edit</button>
                                        <button onClick={() => handleDelete(stay.id)} className="btn-delete-modern">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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
                        Page <strong>{currentPage}</strong> of {Math.ceil(stays.length / entriesPerPage) || 1}
                    </div>
                    <button
                        className="pager-btn"
                        disabled={currentPage >= Math.ceil(stays.length / entriesPerPage)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TravelStayPage;
