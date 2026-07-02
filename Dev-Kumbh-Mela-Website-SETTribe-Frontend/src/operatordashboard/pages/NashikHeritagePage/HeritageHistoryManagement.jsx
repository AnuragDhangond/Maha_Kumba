import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getHeritageHistorySchema } from '../../../schemas/heritageSchemas';
import { scrollAndFocusError } from '../../../utils/validationUtils';
import '../../../styles/DashboardForms.css';

const HeritageHistoryManagement = () => {
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(getHeritageHistorySchema(!!editingItem)),
        mode: 'onTouched',
        defaultValues: {
            title: '',
            subtitle: '',
            heading: '',
            videoUrl: '',
            paragraph1: '',
            paragraph2: '',
            backgroundImage: null,
            status: 'ACTIVE'
        }
    });

    const fileInputRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const entriesPerPage = 10;

    // Backend filtering and pagination: fetch history when search term or page changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHistory(searchTerm, currentPage);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchHistory = async (search = searchTerm, page = currentPage) => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get('/api/admin/heritage/history', {
                params: {
                    page: page - 1,
                    size: entriesPerPage,
                    search: search
                }
            });
            const data = res.data;

            if (data && data.content !== undefined) {
                setHistoryList(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                const list = Array.isArray(data) ? data : [];
                setHistoryList(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            setHistoryList([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        reset({
            title: '',
            subtitle: '',
            heading: '',
            videoUrl: '',
            paragraph1: '',
            paragraph2: '',
            backgroundImage: null,
            status: 'ACTIVE'
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmitForm = async (data) => {
        const { backgroundImage, ...cleanFormData } = data;
        const formDataPayload = new FormData();
        const historyBlob = new Blob([JSON.stringify(cleanFormData)], { type: 'application/json' });
        formDataPayload.append('history', historyBlob);
        if (backgroundImage && backgroundImage.length > 0) {
            formDataPayload.append('image', backgroundImage[0]);
        }

        setIsLoading(true);
        try {
            if (editingItem) {
                await axiosInstance.put(`/api/admin/heritage/history/${editingItem.id}`, formDataPayload);
                Swal.fire({ title: 'Success', text: 'History updated!', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await axiosInstance.post('/api/admin/heritage/history', formDataPayload);
                Swal.fire({ title: 'Success', text: 'History added!', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchHistory(searchTerm, currentPage);
        } catch (error) {
            console.error(error);
            let errorMsg = 'Failed to save record.';
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
                await axiosInstance.delete(`/api/admin/heritage/history/${id}`);
                fetchHistory(searchTerm, currentPage);
            } catch (error) { console.error(error); }
        }
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        reset({
            title: item.title || '',
            subtitle: item.subtitle || '',
            heading: item.heading || '',
            videoUrl: item.videoUrl || '',
            paragraph1: item.paragraph1 || '',
            paragraph2: item.paragraph2 || '',
            backgroundImage: null,
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
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Kumbh History</h1>
                </div>
                {editingItem && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Modify History Record' : 'Add New History Content'}</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.title ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Page Title <span className="required-mark">*</span></label>
                            <input type="text" {...register('title')} className={`form-input-modern ${errors.title ? 'has-error' : ''}`} placeholder="Main title" />
                            {errors.title && <div className="form-error-message">{errors.title.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.subtitle ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Subtitle <span className="required-mark">*</span></label>
                            <input type="text" {...register('subtitle')} className={`form-input-modern ${errors.subtitle ? 'has-error' : ''}`} placeholder="Secondary heading" />
                            {errors.subtitle && <div className="form-error-message">{errors.subtitle.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.heading ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Section Heading <span className="required-mark">*</span></label>
                            <input type="text" {...register('heading')} className={`form-input-modern ${errors.heading ? 'has-error' : ''}`} placeholder="Section heading" />
                            {errors.heading && <div className="form-error-message">{errors.heading.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.videoUrl ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Video Embed URL</label>
                            <input type="text" {...register('videoUrl')} className={`form-input-modern ${errors.videoUrl ? 'has-error' : ''}`} placeholder="https://youtube.com/..." />
                            {errors.videoUrl && <div className="form-error-message">{errors.videoUrl.message}</div>}
                        </div>
                        <div className={`form-group-modern form-span-2 ${errors.paragraph1 ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Paragraph 1 <span className="required-mark">*</span></label>
                            <textarea {...register('paragraph1')} className={`form-input-modern ${errors.paragraph1 ? 'has-error' : ''}`} placeholder="Primary text..." rows="3"></textarea>
                            {errors.paragraph1 && <div className="form-error-message">{errors.paragraph1.message}</div>}
                        </div>
                        <div className={`form-group-modern form-span-2 ${errors.paragraph2 ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Paragraph 2</label>
                            <textarea {...register('paragraph2')} className={`form-input-modern ${errors.paragraph2 ? 'has-error' : ''}`} placeholder="Secondary text..." rows="3"></textarea>
                            {errors.paragraph2 && <div className="form-error-message">{errors.paragraph2.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.backgroundImage ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Background Image {!editingItem && <span className="required-mark">*</span>}</label>
                            <input type="file" {...register('backgroundImage')} ref={(e) => { register('backgroundImage').ref(e); fileInputRef.current = e; }} className={`form-input-modern ${errors.backgroundImage ? 'has-error' : ''}`} accept="image/jpeg,image/png,image/webp" />
                            {errors.backgroundImage && <div className="form-error-message">{errors.backgroundImage.message}</div>}
                            <small style={{ color: '#718096', fontSize: '0.8rem' }}>Max 10MB (JPG, PNG, WebP)</small>
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status <span className="required-mark">*</span></label>
                            <select {...register('status')} className="form-select-modern">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary" disabled={isLoading}>
                            {editingItem ? 'Update Record' : 'Save History Record'}
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
                        <h2 className="title-static">History Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Archival Content Management</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #ff7e36' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Records</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Search history records by Title or Heading..." 
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
                            <th>Content Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyList.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    No history records found matching your search.
                                </td>
                            </tr>
                        ) : (
                            historyList.map(item => (
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

export default HeritageHistoryManagement;
