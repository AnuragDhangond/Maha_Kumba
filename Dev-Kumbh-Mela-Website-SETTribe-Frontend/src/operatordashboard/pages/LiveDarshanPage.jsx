import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { liveDarshanService } from '../../api/services/liveDarshanService';
import axiosInstance from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';

const LiveDarshanPage = () => {
    const [streams, setStreams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStream, setEditingStream] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        viewers: '',
        status: 'LIVE',
        startTime: '',
        endTime: '',
        time: '',
        link: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [youtubeError, setYoutubeError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const entriesPerPage = 10;

    // Backend filtering and pagination: fetch streams when search term or page changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStreams(searchTerm, currentPage);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchStreams = async (search = searchTerm, page = currentPage) => {
        setIsLoading(true);
        try {
            const response = await liveDarshanService.getAllLiveDarshans(search, page - 1, entriesPerPage);
            const data = response.data;
            
            if (data && data.content !== undefined) {
                setStreams(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                const list = Array.isArray(data) ? data : [];
                setStreams(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (error) {
            console.error("Error fetching live streams:", error);
            // Fallback
            if (!search) {
                setStreams([
                    { id: 1, title: 'Morning Aarti', location: 'Ram Kund', viewers: '12K', status: 'LIVE', time: '06:30 AM', startTime: '06:30' },
                    { id: 2, title: 'Sandhya Deepotsav', location: 'Panchavati', viewers: '45K', status: 'SCHEDULED', time: '07:00 PM', startTime: '19:00' }
                ]);
                setTotalPages(1);
                setTotalElements(2);
            } else {
                setStreams([]);
                setTotalPages(1);
                setTotalElements(0);
            }
        } finally {
            setIsLoading(false);
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

    // Helper to validate and extract YouTube ID
    const getYouTubeId = (url) => {
        if (!url || typeof url !== 'string') return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/|shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'link') {
            if (value && !getYouTubeId(value)) {
                setYoutubeError('Invalid YouTube URL format');
            } else {
                setYoutubeError('');
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check for double/multiple extensions (e.g. "image.png.jpg", "file.exe.png")
            const nameParts = file.name.split('.');
            if (nameParts.length > 2) {
                Swal.fire('Invalid File', 'File has multiple extensions which is not allowed. Please upload a valid image file.', 'warning');
                e.target.value = null;
                return;
            }

            // Only allow PNG and JPEG
            const allowedTypes = ['image/jpeg', 'image/png'];
            const allowedExtensions = ['.jpg', '.jpeg', '.png'];
            const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
                Swal.fire('Invalid Format', 'Only PNG and JPEG images are allowed.', 'warning');
                e.target.value = null;
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('File too large', 'Image must be less than 2MB', 'warning');
                e.target.value = null;
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.link && !getYouTubeId(formData.link)) {
            Swal.fire('Invalid Link', 'Please provide a valid YouTube link.', 'error');
            return;
        }

        const data = new FormData();
        data.append('darshan', JSON.stringify(formData));
        if (selectedImage) data.append('image', selectedImage);

        try {
            if (editingStream) {
                await liveDarshanService.updateLiveDarshan(editingStream.id, data);
                Swal.fire({ title: 'Updated!', text: 'Live stream updated successfully.', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await liveDarshanService.createLiveDarshan(data);
                Swal.fire({ title: 'Created!', text: 'New stream added to registry.', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchStreams(searchTerm, currentPage);
        } catch (error) {
            Swal.fire('Error', 'Failed to save stream. Please check your connection.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ 
            title: 'Delete Stream?', 
            text: "This action cannot be undone.",
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#ff5252',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            try {
                await liveDarshanService.deleteLiveDarshan(id);
                Swal.fire('Deleted!', 'Stream has been removed.', 'success');
                fetchStreams(searchTerm, currentPage);
            } catch (error) { console.error(error); }
        }
    };

    const openEditModal = (stream) => {
        setEditingStream(stream);
        setFormData({
            title: stream.title,
            location: stream.location,
            viewers: stream.viewers || '',
            status: stream.status,
            startTime: stream.startTime?.includes('T') ? stream.startTime.substring(11, 16) : stream.startTime || '',
            endTime: stream.endTime?.includes('T') ? stream.endTime.substring(11, 16) : stream.endTime || '',
            time: stream.time || '',
            link: stream.link || ''
        });
        setImagePreview(stream.imagePath ? `${baseURL}${stream.imagePath}` : null);
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingStream(null);
        setFormData({ title: '', location: '', viewers: '', status: 'LIVE', startTime: '', endTime: '', time: '', link: '' });
        setSelectedImage(null);
        setImagePreview(null);
        setYoutubeError('');
    };

    const baseURL = axiosInstance.defaults.baseURL || '';

    const testYouTubeLink = () => {
        if (formData.link) {
            const id = getYouTubeId(formData.link);
            if (id) {
                window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
            } else {
                Swal.fire('Invalid Link', 'Please enter a valid YouTube URL first.', 'info');
            }
        }
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Live Darshan & Aarti</h1>
                </div>
                {editingStream && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white', fontWeight: 'bold' }}>
                        ✕ Cancel Editing
                    </button>
                )}
            </div>

            {/* Management Form */}
            <div className={`dashboard-form-container ${editingStream ? 'form-editing-active' : ''}`}>
                <div className="form-header-modern" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{editingStream ? 'Modify Stream Details' : 'Broadcast New Live Stream'}</h3>
                    {editingStream && <span className="edit-badge">Editing ID: #{editingStream.id}</span>}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern">
                        <div className="form-group-modern form-span-2">
                            <label className="form-label-modern">Stream Title <span className="required-mark">*</span></label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Ganga Aarti Live from Ram Kund" />
                        </div>
                        
                        <div className="form-group-modern">
                            <label className="form-label-modern">Primary Location <span className="required-mark">*</span></label>
                            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Ram Kund, Nashik" />
                        </div>

                        <div className="form-group-modern">
                            <label className="form-label-modern">Current Status <span className="required-mark">*</span></label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="form-select-modern" required>
                                <option value="LIVE">LIVE NOW</option>
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>

                        <div className="form-group-modern form-span-2">
                            <label className="form-label-modern">YouTube Video URL / Link</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    name="link" 
                                    value={formData.link} 
                                    onChange={handleInputChange} 
                                    className={`form-input-modern ${youtubeError ? 'input-error' : ''}`}
                                    placeholder="https://www.youtube.com/watch?v=..." 
                                />
                                <button type="button" onClick={testYouTubeLink} className="btn-dashboard-secondary" style={{ whiteSpace: 'nowrap', padding: '0 15px' }}>
                                    Test Link
                                </button>
                            </div>
                            {youtubeError && <small style={{ color: '#ff5252', marginTop: '5px', display: 'block' }}>{youtubeError}</small>}
                        </div>

                        <div className="form-group-modern">
                            <label className="form-label-modern">{formData.status === 'SCHEDULED' ? 'Scheduled Start Time *' : 'Start Time'}</label>
                            <input 
                                type="time" 
                                name="startTime" 
                                value={formData.startTime} 
                                onChange={handleInputChange} 
                                className="form-input-modern"
                                required={formData.status === 'SCHEDULED'}
                            />
                        </div>

                        <div className="form-group-modern">
                            <label className="form-label-modern">Display Viewers (Manual)</label>
                            <input type="text" name="viewers" value={formData.viewers} onChange={handleInputChange} className="form-input-modern" placeholder="e.g. 15K, 500+, etc." />
                        </div>

                        <div className="form-group-modern form-span-2">
                            <label className="form-label-modern">Stream Thumbnail / Cover Image</label>
                            <div className="file-upload-wrapper-modern">
                                <input type="file" onChange={handleFileChange} accept=".png,.jpg,.jpeg" className="form-input-modern" id="stream-image" />
                                <div className="image-preview-inline">
                                    {imagePreview ? (
                                        <div className="preview-container-form">
                                            <img src={imagePreview} alt="Preview" />
                                            <button type="button" className="remove-img-btn" onClick={() => { setSelectedImage(null); setImagePreview(null); }}>✕</button>
                                        </div>
                                    ) : (
                                        <div className="preview-placeholder-form">
                                            <span>No image selected</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-actions-modern" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <button type="submit" className="btn-dashboard-primary" style={{ minWidth: '180px' }}>
                            {editingStream ? '💾 Save Changes' : '🚀 Publish Stream'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                            Clear Form
                        </button>
                    </div>
                </form>
            </div>

            <div className="table-wrapper-premium" style={{ marginTop: '20px', position: 'relative' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '100px' }}>Preview</th>
                            <th>Stream Details</th>
                            <th>Location & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {streams.map(stream => (
                            <tr key={stream.id}>
                                <td>
                                    <div style={{ width: '70px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {stream.imagePath ? (
                                            <img src={stream.imagePath.startsWith('http') ? stream.imagePath : `${baseURL}${stream.imagePath.startsWith('/') ? '' : '/'}${stream.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : null}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800' }}>{stream.title}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{stream.viewers} watching now</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '700', color: '#ff7e36' }}>{stream.location}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{stream.time || formatTime(stream.startTime)}</div>
                                </td>
                                <td>
                                    <span className={`status-pill status-${(stream.status || '').toLowerCase() === 'live' ? 'resolved' : 'accepted'}`}>{stream.status || 'UNKNOWN'}</span>
                                </td>
                                <td>
                                    <div className="table-actions-modern">
                                        <button onClick={() => openEditModal(stream)} className="btn-edit-modern">Edit</button>
                                        <button onClick={() => handleDelete(stream.id)} className="btn-delete-modern">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );

};

export default LiveDarshanPage;
