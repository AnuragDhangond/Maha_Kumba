import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { poojaScheduleService } from '../../api/services/poojaScheduleService';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';
import useValidation from '../../hooks/useValidation';
import { validateRequired } from '../../utils/validationUtils';
import ValidationError from '../../components/ValidationError';

const PoojaSchedulePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const validationSchema = {
        day: [(v) => validateRequired(v)],
        deity: [
            (v) => validateRequired(v),
            (v) => (/\d/.test(v) ? 'Presiding Deity should not contain numbers' : null),
            (v) => (!/^[a-zA-Z\s.'-]+$/.test(v) ? 'Presiding Deity contains invalid characters' : null),
            (v) => (v && v.trim().length < 2 ? 'Presiding Deity must be at least 2 characters' : null)
        ],
        specialPooja: [
            (v) => validateRequired(v),
            (v) => (/\d/.test(v) ? 'Special Pooja / Ritual should not contain numbers' : null),
            (v) => (!/^[a-zA-Z\s.'-]+$/.test(v) ? 'Special Pooja / Ritual contains invalid characters' : null),
            (v) => (v && v.trim().length < 2 ? 'Special Pooja / Ritual must be at least 2 characters' : null)
        ],
        icon: [
            (v) => validateRequired(v),
            (v) => (/\d/.test(v) ? 'Icon Letter should not contain numbers' : null),
            (v) => (!/^[a-zA-Z]$/.test(v) ? 'Icon Letter must be a single letter (A-Z or a-z)' : null)
        ],
        place: [
            (v) => validateRequired(v),
            (v) => (/\d/.test(v) ? 'Location / Ghat should not contain numbers' : null),
            (v) => (!/^[a-zA-Z\s.'-]+$/.test(v) ? 'Location / Ghat contains invalid characters' : null),
            (v) => (v && v.trim().length < 2 ? 'Location / Ghat must be at least 2 characters' : null)
        ],
        description: [
            (v) => validateRequired(v),
            (v) => (v && v.trim().length < 10 ? 'Description must be at least 10 characters' : null)
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
        day: 'Monday',
        deity: '',
        specialPooja: '',
        icon: '',
        time: '',
        place: '',
        description: ''
    }, validationSchema);

    // Physically block numbers from being typed
    const preventNumbers = (e) => {
        if (/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await poojaScheduleService.getAllSchedules();
            const data = response.data?.content || (Array.isArray(response.data) ? response.data : []);
            setSchedules(data);
        } catch (error) {
            console.error("Error fetching schedules:", error);
            setSchedules([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
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
            Swal.fire('Error', 'Failed to save schedule.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#4a2a18' });
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
            time: schedule.time || '',
            place: schedule.place || '',
            description: schedule.description || ''
        });
        setErrors({});
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingSchedule(null);
        resetValidationForm();
        setErrors({});
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
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
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Day of Week <span className="required-mark">*</span></label>
                            <select name="day" value={formData.day} onChange={handleChange} className="form-select-modern" required>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ValidationError error={errors.day} />
                        </div>
                        <div className={`form-group-modern ${errors.deity ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Presiding Deity <span className="required-mark">*</span></label>
                            <input type="text" name="deity" value={formData.deity} onChange={handleChange} onKeyPress={preventNumbers} className="form-input-modern" required placeholder="e.g. Lord Shiva" />
                            <ValidationError error={errors.deity} />
                        </div>
                        <div className={`form-group-modern ${errors.specialPooja ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Special Pooja / Ritual <span className="required-mark">*</span></label>
                            <input type="text" name="specialPooja" value={formData.specialPooja} onChange={handleChange} onKeyPress={preventNumbers} className="form-input-modern" required placeholder="e.g. Rudrabhishek" />
                            <ValidationError error={errors.specialPooja} />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Time Slot</label>
                            <input type="text" name="time" value={formData.time} onChange={handleChange} className="form-input-modern" placeholder="e.g. 05:00 AM - 07:30 AM" />
                        </div>
                        <div className={`form-group-modern ${errors.place ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Location / Ghat <span className="required-mark">*</span></label>
                            <input type="text" name="place" value={formData.place} onChange={handleChange} onKeyPress={preventNumbers} className="form-input-modern" placeholder="e.g. Ram Kund" required />
                            <ValidationError error={errors.place} />
                        </div>
                        <div className={`form-group-modern ${errors.icon ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Icon Letter <span className="required-mark">*</span></label>
                            <input type="text" name="icon" value={formData.icon} onChange={handleChange} onKeyPress={preventNumbers} className="form-input-modern" placeholder="e.g. M" maxLength="1" required />
                            <ValidationError error={errors.icon} />
                        </div>
                        <div className={`form-group-modern form-span-3 ${errors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Description <span className="required-mark">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="form-input-modern" placeholder="Spiritual significance..." rows="3" required></textarea>
                            <ValidationError error={errors.description} />
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
                            <span className="digit">{schedules.length}</span>
                            <span className="lab">Schedules</span>
                        </div>
                    </div>
                </div>
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
                            {schedules.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map(schedule => (
                                <tr key={schedule.id}>
                                    <td><span className="status-pill status-accepted">{schedule.day}</span></td>
                                    <td>
                                        <div style={{ fontWeight: '800' }}>{schedule.deity}</div>
                                        <div style={{ color: '#ff7e36', fontSize: '0.9rem', fontWeight: '700' }}>{schedule.specialPooja}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{schedule.time}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{schedule.place}</div>
                                    </td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => openEditForm(schedule)} className="btn-edit-modern">Edit</button>
                                            <button onClick={() => handleDelete(schedule.id)} className="btn-delete-modern">Delete</button>
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
                        <div className="pagination-info">
                            Page <strong>{currentPage}</strong> of {Math.ceil(schedules.length / entriesPerPage) || 1}
                        </div>
                        <button
                            className="pager-btn"
                            disabled={currentPage >= Math.ceil(schedules.length / entriesPerPage)}
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
