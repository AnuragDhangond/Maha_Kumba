import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { helplineService } from '../../api/services/helplineService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { helplineSchema } from '../../schemas/healthSafetySchemas';
import { scrollAndFocusError } from '../../utils/validationUtils';
import '../../styles/DashboardForms.css';

const HelplinePage = () => {
    const [helplines, setHelplines] = useState([]);
    const [editingHelpline, setEditingHelpline] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(helplineSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            number: ''
        }
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const entriesPerPage = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHelplines();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchHelplines = async () => {
        try {
            const response = await helplineService.getHelplines(currentPage - 1, entriesPerPage, searchTerm);
            const data = response.data;
            if (data && data.content) {
                setHelplines(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                setHelplines(Array.isArray(data) ? data : []);
                setTotalElements(Array.isArray(data) ? data.length : 0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Error fetching helplines:", error);
        }
    };

    const onSubmitForm = async (data) => {
        try {
            if (editingHelpline) {
                await helplineService.updateHelpline(editingHelpline.id, data);
                Swal.fire({ title: 'Updated!', text: 'Helpline updated.', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await helplineService.createHelpline(data);
                Swal.fire({ title: 'Created!', text: 'New helpline added.', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchHelplines();
        } catch (error) {
            Swal.fire('Error', 'Could not save helpline.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try {
                await helplineService.deleteHelpline(id);
                fetchHelplines();
            } catch (error) { console.error(error); }
        }
    };

    const openEditForm = (helpline) => {
        setEditingHelpline(helpline);
        reset({ name: helpline.name, number: helpline.number });
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingHelpline(null);
        reset({ name: '', number: '' });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Emergency Helplines</h1>
                </div>
                {editingHelpline && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingHelpline ? 'Modify Helpline' : 'Add New Helpline'}</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.name ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Authority Name <span className="required-mark">*</span></label>
                            <input type="text" {...register('name')} className={`form-input-modern ${errors.name ? 'has-error' : ''}`} placeholder="e.g. Mela Control Room" />
                            {errors.name && <div className="form-error-message">{errors.name.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.number ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Contact Number <span className="required-mark">*</span></label>
                            <input type="text" {...register('number')} className={`form-input-modern ${errors.number ? 'has-error' : ''}`} placeholder="e.g. 1077" />
                            {errors.number && <div className="form-error-message">{errors.number.message}</div>}
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingHelpline ? 'Update Helpline' : 'Add Helpline'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(244, 67, 54, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#f44336' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Helplines Registry</h2>
                        <span className="subtitle-static">Nashik 2027 • 24/7 Emergency Support</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #f44336' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Contacts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search helplines by name or number..." 
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
                            <th>Authority Name</th>
                            <th>Contact Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {helplines.length === 0 ? (
                            <tr><td colSpan="3" className="text-center p-8 text-muted">No helplines found.</td></tr>
                        ) : (
                            helplines.map(hl => (
                                <tr key={hl.id}>
                                    <td className="font-semibold">{hl.name}</td>
                                    <td>
                                        <a href={`tel:${hl.number}`} style={{ textDecoration: 'none', color: '#ff7e36', fontWeight: '800' }}>
                                            {hl.number}
                                        </a>
                                    </td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => openEditForm(hl)} className="btn-edit-modern">Edit</button>
                                            <button onClick={() => handleDelete(hl.id)} className="btn-delete-modern">Delete</button>
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

export default HelplinePage;
