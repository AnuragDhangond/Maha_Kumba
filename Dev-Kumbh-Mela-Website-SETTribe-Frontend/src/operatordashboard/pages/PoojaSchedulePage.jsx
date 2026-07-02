import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { poojaScheduleService } from '../../api/services/poojaScheduleService';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';

const PoojaSchedulePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        day: 'Monday',
        deity: '',
        specialPooja: '',
        icon: '',
        startTime: '',
        endTime: '',
        place: '',
        description: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [validated, setValidated] = useState(false);
    const entriesPerPage = 10;

    // Backend filtering and pagination: fetch schedules when search term or page changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSchedules(searchTerm, currentPage);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchSchedules = async (search = '', page = 1) => {
        setIsLoading(true);
        try {
            const response = await poojaScheduleService.getAllSchedules(search, page - 1, entriesPerPage);
            const data = response.data;
            
            if (data && data.content !== undefined) {
                setSchedules(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                const list = Array.isArray(data) ? data : [];
                setSchedules(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (error) {
            console.error("Error fetching schedules:", error);
            setSchedules([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        const form = e.currentTarget;
        e.preventDefault();

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        // Validation checks for deity, specialPooja, place, icon
        if (/\d/.test(formData.deity)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Presiding Deity should not contain numbers.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }
        if (formData.deity && !/^[a-zA-Z\s.'-]+$/.test(formData.deity)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Presiding Deity contains invalid characters.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }
        if (formData.deity && formData.deity.trim().length < 2) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Presiding Deity must be at least 2 characters.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        if (/\d/.test(formData.specialPooja)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Special Pooja / Ritual should not contain numbers.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }
        if (formData.specialPooja && !/^[a-zA-Z\s.'-]+$/.test(formData.specialPooja)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Special Pooja / Ritual contains invalid characters.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }
        if (formData.specialPooja && formData.specialPooja.trim().length < 2) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Special Pooja / Ritual must be at least 2 characters.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        if (/\d/.test(formData.place)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Location / Ghat should not contain numbers.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }
        if (formData.place && !/^[a-zA-Z\s.'-]+$/.test(formData.place)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Location / Ghat contains invalid characters.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }
        if (formData.place && formData.place.trim().length < 2) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Location / Ghat must be at least 2 characters.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        if (/\d/.test(formData.icon)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Icon Letter should not contain numbers.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }
        if (formData.icon && !/^[a-zA-Z]$/.test(formData.icon)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Icon Letter must be a single letter (A-Z or a-z).',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        if (formData.description && formData.description.trim().length < 10) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Description must be at least 10 characters.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (formData.startTime < today) {
            Swal.fire({
                title: 'Invalid Date',
                text: 'The schedule date cannot be in the past.',
                icon: 'warning',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        setValidated(true);
        try {
            // Logic to format time display if needed for backend 'time' field 
            // but we'll store startTime and endTime separately as requested
            if (editingSchedule) {
                await poojaScheduleService.updateSchedule(editingSchedule.id, formData);
                Swal.fire({ title: 'Updated!', text: 'Schedule saved.', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await poojaScheduleService.createSchedule(formData);
                Swal.fire({ title: 'Created!', text: 'New schedule added.', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchSchedules();
        } catch (error) {
            console.error(error);
            let errorMsg = 'Failed to save schedule.';
            if (error.response?.data) {
                const data = error.response.data;
                if (data.errors && typeof data.errors === 'object') {
                    errorMsg = Object.values(data.errors).join(', ');
                } else if (data.message) {
                    errorMsg = data.message;
                }
            }
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try {
                await poojaScheduleService.deleteSchedule(id);
                fetchSchedules();
            } catch (error) { console.error(error); }
        }
    };

    const openEditForm = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            day: schedule.day,
            deity: schedule.deity,
            specialPooja: schedule.specialPooja,
            icon: schedule.icon || '',
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            place: schedule.place || '',
            description: schedule.description || ''
        });
        setValidated(false);
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingSchedule(null);
        setFormData({ day: 'Monday', deity: '', specialPooja: '', icon: '', startTime: '', endTime: '', place: '', description: '' });
        setValidated(false);
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        try {
            if (!timeStr.includes(':')) {
                // Return as is if it's a date or doesn't have time format
                return timeStr;
            }
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hh = h % 12 || 12;
            return `${hh}:${minutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    if (isLoading) {
        return (
            <div className="admin-page-content animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div className="text-center">
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⌛</div>
                    <h3>Loading Sacred Schedules...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Sacred Pooja Schedule</h1>
                </div>
                {editingSchedule && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingSchedule ? 'Modify Entry' : 'New Schedule Entry'}</h3>
                </div>
                <form className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate onSubmit={handleSubmit}>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Day of Week <span className="required-mark">*</span></label>
                            <select name="day" value={formData.day} onChange={handleInputChange} className="form-select-modern" required>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Presiding Deity <span className="required-mark">*</span></label>
                            <input type="text" name="deity" value={formData.deity} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Lord Shiva" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Special Pooja / Ritual <span className="required-mark">*</span></label>
                            <input type="text" name="specialPooja" value={formData.specialPooja} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Rudrabhishek" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Date <span className="required-mark">*</span></label>
                            <input type="date" name="startTime" value={formData.startTime} onChange={handleInputChange} className="form-input-modern" min={new Date().toISOString().split('T')[0]} required />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Start Time <span className="required-mark">*</span></label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="form-input-modern" required />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Location / Ghat <span className="required-mark">*</span></label>
                            <input type="text" name="place" value={formData.place} onChange={handleInputChange} className="form-input-modern" placeholder="e.g. Ram Kund" required />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Icon Letter <span className="required-mark">*</span></label>
                            <input type="text" name="icon" value={formData.icon} onChange={handleInputChange} className="form-input-modern" placeholder="e.g. M" maxLength="1" required />
                        </div>
                        <div className="form-group-modern form-span-3">
                            <label className="form-label-modern">Description <span className="required-mark">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input-modern" placeholder="Spiritual significance..." rows="3" required></textarea>
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingSchedule ? 'Update Schedule' : 'Publish Schedule'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(255, 152, 0, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#ff9800' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Sacred Days Registry</h2>
                        <span className="subtitle-static">Nashik 2027 • Weekly Ritual Schedule</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #ff9800' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Schedules</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Search schedules by Deity, Pooja or Place..." 
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
                            <th>Day</th>
                            <th>Deity & Pooja</th>
                            <th>Schedule Info</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                    No sacred schedules found matching your search.
                                </td>
                            </tr>
                        ) : (
                            schedules.map(schedule => (
                                <tr key={schedule.id}>
                                    <td><span className="status-pill status-accepted">{schedule.day}</span></td>
                                    <td>
                                        <div style={{ fontWeight: '800' }}>{schedule.deity}</div>
                                        <div style={{ color: '#ff7e36', fontSize: '0.9rem', fontWeight: '700' }}>{schedule.specialPooja}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{schedule.place}</div>
                                    </td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => openEditForm(schedule)} className="btn-edit-modern">Edit</button>
                                            <button onClick={() => handleDelete(schedule.id)} className="btn-delete-modern">Delete</button>
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

export default PoojaSchedulePage;
