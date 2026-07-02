import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { helplineService } from '../../api/services/helplineService';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';

const HelplinePage = () => {
    const [helplines, setHelplines] = useState([]);
    const [editingHelpline, setEditingHelpline] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        status: 'ACTIVE'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [includeInactive, setIncludeInactive] = useState(true);
    const entriesPerPage = 10;

    // Validation states
    const [nameStatus, setNameStatus] = useState({ message: '', available: null });
    const [numberStatus, setNumberStatus] = useState({ message: '', available: null });

    // Validate Name
    useEffect(() => {
        const validateName = async () => {
            if (!formData.name || editingHelpline) {
                setNameStatus({ message: '', available: null });
                return;
            }
            try {
                const data = await helplineService.checkName(formData.name);
                setNameStatus({ message: data.message, available: !data.exists });
            } catch (err) {
                console.error("Name validation failed:", err);
            }
        };

        const timer = setTimeout(validateName, 500);
        return () => clearTimeout(timer);
    }, [formData.name, editingHelpline]);

    // Validate Number
    useEffect(() => {
        const validateNumber = async () => {
            if (!formData.number || editingHelpline) {
                setNumberStatus({ message: '', available: null });
                return;
            }
            try {
                const data = await helplineService.checkNumber(formData.number);
                setNumberStatus({ message: data.message, available: !data.exists });
            } catch (err) {
                console.error("Number validation failed:", err);
            }
        };

        const timer = setTimeout(validateNumber, 500);
        return () => clearTimeout(timer);
    }, [formData.number, editingHelpline]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHelplines();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, includeInactive]);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchHelplines = async () => {
        try {
            const response = await helplineService.getHelplines(currentPage - 1, entriesPerPage, searchTerm, includeInactive);
            const data = response.data;
            setHelplines(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching helplines:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingHelpline) {
                await helplineService.updateHelpline(editingHelpline.id, formData);
                Swal.fire({ title: 'Updated!', text: 'Helpline updated.', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await helplineService.createHelpline(formData);
                Swal.fire({ title: 'Created!', text: 'New helpline added.', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchHelplines();
        } catch (error) {
            Swal.fire('Error', 'Could not save helpline.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Deactivate?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#4a2a18' });
        if (result.isConfirmed) {
            try {
                await helplineService.deleteHelpline(id);
                fetchHelplines();
            } catch (error) { console.error(error); }
        }
    };

    const handleActivate = async (id) => {
        try {
            await helplineService.updateHelpline(id, { ...helplines.find(h => h.id === id), status: 'ACTIVE' });
            Swal.fire({ title: 'Activated!', text: 'Helpline activated.', icon: 'success', confirmButtonColor: '#4a2a18' });
            fetchHelplines();
        } catch (error) { console.error(error); }
    };

    const openEditForm = (helpline) => {
        setEditingHelpline(helpline);
        setFormData({ 
            name: helpline.name, 
            number: helpline.number,
            status: helpline.status || 'ACTIVE'
        });
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingHelpline(null);
        setFormData({ name: '', number: '', status: 'ACTIVE' });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
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
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Authority Name <span className="required-mark">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`form-input-modern ${nameStatus.available === false ? 'input-error' : nameStatus.available === true ? 'input-success' : ''}`} required placeholder="e.g. Mela Control Room" />
                            {nameStatus.message && (
                                <div style={{ fontSize: '12px', marginTop: '4px', color: nameStatus.available ? '#2e7d32' : '#c62828', fontWeight: '500' }}>
                                    {nameStatus.available ? '✓ ' : '✕ '} {nameStatus.message}
                                </div>
                            )}
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Contact Number <span className="required-mark">*</span></label>
                            <input type="text" name="number" value={formData.number} onChange={handleInputChange} className={`form-input-modern ${numberStatus.available === false ? 'input-error' : numberStatus.available === true ? 'input-success' : ''}`} required placeholder="e.g. 1077" />
                            {numberStatus.message && (
                                <div style={{ fontSize: '12px', marginTop: '4px', color: numberStatus.available ? '#2e7d32' : '#c62828', fontWeight: '500' }}>
                                    {numberStatus.available ? '✓ ' : '✕ '} {numberStatus.message}
                                </div>
                            )}
                        </div>
                        {editingHelpline && (
                            <div className="form-group-modern">
                                <label className="form-label-modern">Registry Status</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleInputChange}
                                    className="form-select-modern"
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" disabled={nameStatus.available === false || numberStatus.available === false} className="btn-dashboard-primary">
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
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {helplines.length === 0 ? (
                                <tr><td colSpan="4" className="text-center p-8 text-muted">No helplines found.</td></tr>
                            ) : (
                                helplines.map(hl => (
                                    <tr key={hl.id}>
                                        <td className="font-semibold">{hl.name}</td>
                                        <td>
                                            <a href={`tel:${hl.number}`} style={{ textDecoration: 'none', color: 'var(--admin-accent)', fontWeight: '800' }}>
                                                {hl.number}
                                            </a>
                                        </td>
                                        <td>
                                            <span className={`status-pill status-${(hl.status || 'ACTIVE').toLowerCase() === 'active' ? 'completed' : 'failed'}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
                                                {hl.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions-modern">
                                                <button onClick={() => openEditForm(hl)} className="btn-edit-modern">Edit</button>
                                                {hl.status === 'INACTIVE' ? (
                                                    <button onClick={() => handleActivate(hl.id)} className="btn-edit-modern" style={{ background: '#10b981', color: 'white' }}>Activate</button>
                                                ) : (
                                                    <button onClick={() => handleDelete(hl.id)} className="btn-delete-modern">Deactivate</button>
                                                )}
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
