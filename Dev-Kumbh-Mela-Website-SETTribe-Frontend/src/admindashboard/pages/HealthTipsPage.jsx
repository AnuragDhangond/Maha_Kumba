import React, { useState, useEffect } from 'react';
import { healthTipService } from '../../api/services/healthTipService';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';

const HealthTipsPage = () => {
    const [tips, setTips] = useState([]);
    const [editingTip, setEditingTip] = useState(null);
    const [formData, setFormData] = useState({
        category: 'HEALTH',
        tipText: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    useEffect(() => {
        fetchTips();
    }, []);

    const fetchTips = async () => {
        try {
            const response = await healthTipService.getAllTips();
            setTips(response.data);
        } catch (error) {
            console.error("Error fetching tips:", error);
            setTips([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTip) {
                await healthTipService.updateTip(editingTip.id, formData);
                Swal.fire({ title: 'Updated!', text: 'Tip updated successfully.', icon: 'success', confirmButtonColor: '#4a2a18' });
            } else {
                await healthTipService.createTip(formData);
                Swal.fire({ title: 'Created!', text: 'New tip added successfully.', icon: 'success', confirmButtonColor: '#4a2a18' });
            }
            resetForm();
            fetchTips();
        } catch (error) {
            console.error("Error saving tip:", error);
            Swal.fire('Error', 'Failed to save tip.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Tip?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff5252',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await healthTipService.deleteTip(id);
                Swal.fire('Deleted!', 'Tip removed successfully.', 'success');
                fetchTips();
            } catch (error) {
                console.error("Error deleting tip:", error);
                Swal.fire('Error', 'Failed to delete tip.', 'error');
            }
        }
    };

    const openEditForm = (tip) => {
        setEditingTip(tip);
        setFormData({
            category: tip.category,
            tipText: tip.tipText
        });
        const scrollContainer = document.querySelector('.admin-content');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const resetForm = () => {
        setEditingTip(null);
        setFormData({
            category: 'HEALTH',
            tipText: ''
        });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Health & Safety Advisories</h1>
                </div>
                {editingTip && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingTip ? 'Modify Advisory' : 'Register New Advisory'}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern" style={{ gridTemplateColumns: '1fr 2fr' }}>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Category <span className="required-mark">*</span></label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="form-select-modern" required>
                                <option value="HEALTH">Health & Hygiene</option>
                                <option value="SAFETY">Safety Advisory</option>
                            </select>
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Advisory Text <span className="required-mark">*</span></label>
                            <input type="text" name="tipText" value={formData.tipText} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Drink only from purified water points" />
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingTip ? 'Update Tip' : 'Publish Health Tip'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(76, 175, 80, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#4caf50' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Advisories Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Live Safety & Health Guidelines</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4caf50' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{tips.length}</span>
                            <span className="lab">Active Tips</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper-premium" style={{ marginTop: '20px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Advisory Content</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tips.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map(tip => (
                                <tr key={tip.id}>
                                    <td style={{ width: '200px' }}>
                                        <span className={`status-pill status-${tip.category === 'HEALTH' ? 'completed' : 'accepted'}`}>
                                            {tip.category === 'HEALTH' ? 'Health & Hygiene' : 'Safety Advisory'}
                                        </span>
                                    </td>
                                    <td className="font-semibold">{tip.tipText}</td>
                                    <td style={{ width: '150px' }}>
                                        <div className="table-actions-modern">
                                            <button onClick={() => openEditForm(tip)} className="btn-edit-modern">Edit</button>
                                            <button onClick={() => handleDelete(tip.id)} className="btn-delete-modern">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tips.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                        No advisories found. Register one to get started!
                                    </td>
                                </tr>
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
                            Page <strong>{currentPage}</strong> of {Math.ceil(tips.length / entriesPerPage) || 1}
                        </div>
                        <button 
                            className="pager-btn" 
                            disabled={currentPage >= Math.ceil(tips.length / entriesPerPage)} 
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

export default HealthTipsPage;
