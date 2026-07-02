import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getKumbhHighlightSchema } from '../../../schemas/heritageSchemas';
import { scrollAndFocusError } from '../../../utils/validationUtils';
import '../../../styles/DashboardForms.css';

const KumbhHighlightsManagement = () => {
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
        resolver: zodResolver(getKumbhHighlightSchema(!!editingItem)),
        mode: 'onTouched',
        defaultValues: {
            year: '',
            title: '',
            description: '',
            videoUrl: '',
            thumbnailImage: null,
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
            const res = await axiosInstance.get('/api/admin/heritage/highlights', {
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
            console.error("Error fetching highlights:", error);
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
            year: '',
            title: '',
            description: '',
            videoUrl: '',
            thumbnailImage: null,
            displayOrder: 0,
            status: 'ACTIVE'
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmitForm = async (data) => {
        const { thumbnailImage, ...cleanFormData } = data;
        const formDataPayload = new FormData();
        const highlightBlob = new Blob([JSON.stringify(cleanFormData)], { type: 'application/json' });
        formDataPayload.append('highlight', highlightBlob);
        if (thumbnailImage && thumbnailImage.length > 0) {
            formDataPayload.append('image', thumbnailImage[0]);
        }

        setIsLoading(true);
        try {
            if (editingItem) {
                await axiosInstance.put(`/api/admin/heritage/highlights/${editingItem.id}`, formDataPayload);
                Swal.fire({ title: 'Success', text: 'Highlight updated!', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await axiosInstance.post('/api/admin/heritage/highlights', formDataPayload);
                Swal.fire({ title: 'Success', text: 'Highlight added!', icon: 'success', confirmButtonColor: '#4a2a18' });
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
                await axiosInstance.delete(`/api/admin/heritage/highlights/${id}`);
                fetchData();
            } catch (error) { console.error(error); }
        }
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        reset({
            year: item.year || '',
            title: item.title || '',
            description: item.description || '',
            videoUrl: item.videoUrl || '',
            thumbnailImage: null,
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
                    <h1 className="page-title">Past Highlights</h1>
                </div>
                {editingItem && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Modify Highlight' : 'Post New Highlight'}</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.year ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Year / Duration <span className="required-mark">*</span></label>
                            <input type="text" {...register('year')} className={`form-input-modern ${errors.year ? 'has-error' : ''}`} placeholder="e.g. August 2015" />
                            {errors.year && <div className="form-error-message">{errors.year.message}</div>}
                        </div>
                        <div className={`form-group-modern form-span-2 ${errors.title ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Highlight Title <span className="required-mark">*</span></label>
                            <input type="text" {...register('title')} className={`form-input-modern ${errors.title ? 'has-error' : ''}`} placeholder="e.g. Royal Shahi Snan" />
                            {errors.title && <div className="form-error-message">{errors.title.message}</div>}
                        </div>
                        <div className={`form-group-modern form-span-3 ${errors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Description <span className="required-mark">*</span></label>
                            <textarea {...register('description')} className={`form-input-modern ${errors.description ? 'has-error' : ''}`} placeholder="Brief summary..." rows="3"></textarea>
                            {errors.description && <div className="form-error-message">{errors.description.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.videoUrl ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Video URL (Optional)</label>
                            <input type="text" {...register('videoUrl')} className={`form-input-modern ${errors.videoUrl ? 'has-error' : ''}`} placeholder="YouTube URL" />
                            {errors.videoUrl && <div className="form-error-message">{errors.videoUrl.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.thumbnailImage ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Thumbnail Image {!editingItem && <span className="required-mark">*</span>}</label>
                            <input type="file" {...register('thumbnailImage')} ref={(e) => { register('thumbnailImage').ref(e); fileInputRef.current = e; }} className={`form-input-modern ${errors.thumbnailImage ? 'has-error' : ''}`} accept="image/jpeg,image/png,image/webp" />
                            {errors.thumbnailImage && <div className="form-error-message">{errors.thumbnailImage.message}</div>}
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
                            {editingItem ? 'Update Highlight' : 'Save Highlight'}
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

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Search highlights by Title, Description or Year..." 
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
                            <th>Details</th>
                            <th>Status</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    No highlights found matching your search.
                                </td>
                            </tr>
                        ) : (
                            list.map(item => (
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

export default KumbhHighlightsManagement;
