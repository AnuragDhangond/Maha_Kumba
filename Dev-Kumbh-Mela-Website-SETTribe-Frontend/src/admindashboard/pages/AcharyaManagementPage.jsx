import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { acharyaService } from '../../api/services/acharyaService';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosConfig';
import '../../styles/DashboardForms.css';

const AcharyaManagementPage = () => {
    const [acharyas, setAcharyas] = useState([]);
    const [editingAcharya, setEditingAcharya] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        experience: '',
        rating: 5.0,
        reviews: 0,
        location: 'Trimbakeshwar',
        poojas: []
    });

    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    const [newPooja, setNewPooja] = useState({ name: '', price: '', duration: '' });

    useEffect(() => {
        fetchAcharyas();
    }, []);

    const fetchAcharyas = async () => {
        try {
            const response = await acharyaService.getAllAcharyas();
            const data = response.data?.content || (Array.isArray(response.data) ? response.data : []);
            setAcharyas(data);
        } catch (error) {
            console.error("Error fetching acharyas:", error);
            setAcharyas([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            // Check for double/multiple extensions
            const nameParts = file.name.split('.');
            if (nameParts.length > 2) {
                Swal.fire('Invalid File', 'File has multiple extensions which is not allowed.', 'warning');
                e.target.value = null;
                return;
            }

            // Only allow JPG and JPEG
            const allowedTypes = ['image/jpeg'];
            const allowedExtensions = ['.jpg', '.jpeg'];
            const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
                Swal.fire('Invalid Format', 'Only JPG and JPEG images are allowed.', 'warning');
                e.target.value = null;
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('File too large', 'Image must be less than 2MB', 'warning');
                e.target.value = null;
                return;
            }
            setImageFile(file);
        }
    };

    const addPooja = () => {
        if (!newPooja.name || !newPooja.price) {
            Swal.fire('Error', 'Pooja name and price are required', 'error');
            return;
        }
        setFormData(prev => ({
            ...prev,
            poojas: [...prev.poojas, { ...newPooja, price: parseFloat(newPooja.price) }]
        }));
        setNewPooja({ name: '', price: '', duration: '' });
    };

    const removePooja = (index) => {
        setFormData(prev => ({
            ...prev,
            poojas: prev.poojas.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAcharya) {
                await acharyaService.updateAcharya(editingAcharya.id, formData, imageFile);
                Swal.fire('Updated!', 'Acharya details updated successfully.', 'success');
            } else {
                await acharyaService.createAcharya(formData, imageFile);
                Swal.fire('Created!', 'New Acharya added successfully.', 'success');
            }
            resetForm();
            fetchAcharyas();
        } catch (error) {
            console.error("Acharya Save Error:", error.response?.data || error);
            
            let errorMessage = "An unexpected error occurred.";
            const responseData = error.response?.data;
            
            if (responseData) {
                if (responseData.message) {
                    errorMessage = responseData.message;
                    // If there are validation errors, append them
                    if (responseData.errors) {
                        const errorDetails = Object.entries(responseData.errors)
                            .map(([field, msg]) => `• ${field}: ${msg}`)
                            .join('\n');
                        errorMessage += `:\n${errorDetails}`;
                    }
                } else if (typeof responseData === 'string') {
                    errorMessage = responseData;
                }
            } else {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: 'error',
                title: editingAcharya ? 'Update Failed' : 'Creation Failed',
                text: errorMessage,
                confirmButtonColor: '#4a2a18'
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Acharya?',
            text: "This will remove the Acharya and their poojas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4a2a18'
        });

        if (result.isConfirmed) {
            try {
                await acharyaService.deleteAcharya(id);
                fetchAcharyas();
            } catch (error) { console.error(error); }
        }
    };

    const openEditModal = (acharya) => {
        setEditingAcharya(acharya);
        setFormData({
            name: acharya.name,
            specialty: acharya.specialty,
            experience: acharya.experience || '',
            rating: acharya.rating || 5.0,
            reviews: acharya.reviews || 0,
            location: acharya.location || 'Trimbakeshwar',
            poojas: acharya.poojas || []
        });
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingAcharya(null);
        setImageFile(null);
        setFormData({
            name: '', specialty: '', experience: '', rating: 5.0, reviews: 0, location: 'Trimbakeshwar', poojas: []
        });
        setNewPooja({ name: '', price: '', duration: '' });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Manage Acharyas</h1>
                </div>
                {editingAcharya && (
                    <button onClick={resetForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingAcharya ? 'Edit Acharya' : 'Register New Acharya'}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Full Name <span className="required-mark">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Acharya Ramakant Shastri" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Specialty <span className="required-mark">*</span></label>
                            <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. Vedic Rituals" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="form-input-modern" placeholder="e.g. Trimbakeshwar" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Experience (Years)</label>
                            <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="form-input-modern" placeholder="e.g. 25+ Years" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Profile Picture</label>
                            <input type="file" onChange={handleImageChange} className="form-input-modern" accept=".jpg,.jpeg" />
                        </div>

                        {/* Pooja Sub-form */}
                        <div className="form-span-3" style={{ border: '1px solid var(--admin-border)', padding: '24px', borderRadius: '16px', background: 'var(--admin-sidebar-bg)', marginTop: '10px' }}>
                            <h4 style={{ marginBottom: '20px', color: 'var(--admin-accent)', fontSize: '1.1rem', fontWeight: '800' }}>Pooja Offerings</h4>
                            <div className="form-grid-modern" style={{ alignItems: 'flex-end', marginBottom: '20px' }}>
                                <div className="form-group-modern">
                                    <label className="form-label-modern">Pooja Name</label>
                                    <input type="text" value={newPooja.name} onChange={(e) => setNewPooja({...newPooja, name: e.target.value})} className="form-input-modern" placeholder="e.g. Kalsarp Shanti" />
                                </div>
                                <div className="form-group-modern">
                                    <label className="form-label-modern">Price (₹)</label>
                                    <input type="number" value={newPooja.price} onChange={(e) => setNewPooja({...newPooja, price: e.target.value})} className="form-input-modern" placeholder="e.g. 5100" />
                                </div>
                                <div className="form-group-modern">
                                    <label className="form-label-modern">Duration</label>
                                    <div className="form-input-with-button">
                                        <input type="text" value={newPooja.duration} onChange={(e) => setNewPooja({...newPooja, duration: e.target.value})} className="form-input-modern" placeholder="e.g. 2 Hours" />
                                        <button type="button" onClick={addPooja} className="btn-dashboard-primary" style={{ padding: '0 20px', height: '48px', borderRadius: '8px' }}>Add</button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {formData.poojas.length === 0 ? (
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096', fontStyle: 'italic' }}>No ritual offerings added yet.</p>
                                ) : (
                                    formData.poojas.map((pooja, index) => (
                                        <div key={index} style={{ background: 'var(--admin-sub-bg)', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--admin-text)' }}>{pooja.name}</span>
                                            <span style={{ color: 'var(--admin-accent)', fontWeight: '800' }}>₹{pooja.price}</span>
                                            <button type="button" onClick={() => removePooja(index)} style={{ border: 'none', background: 'rgba(229, 62, 62, 0.1)', color: '#ff5252', cursor: 'pointer', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingAcharya ? 'Update Acharya' : 'Register Acharya'}
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
                        <h2 className="title-static">Spiritual Guides Directory</h2>
                        <span className="subtitle-static">Maha Kumbh • Official Acharya Registry</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4caf50' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{acharyas.length}</span>
                            <span className="lab">Registered</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper-premium">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Acharya</th>
                            <th>Specialty & Location</th>
                            <th>Offerings</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {acharyas.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map(acharya => (
                            <tr key={acharya.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        {acharya.imagePath ? (
                                            <img src={`${axiosInstance.defaults.baseURL}${acharya.imagePath}`} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff7e36' }} />
                                        ) : (
                                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}></div>
                                        )}
                                        <div style={{ fontWeight: '800', color: 'var(--admin-text)' }}>{acharya.name}</div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '700', color: 'var(--admin-text)' }}>{acharya.specialty}</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.6, color: 'var(--admin-text)' }}>{acharya.location} • {acharya.experience}</div>
                                </td>
                                <td>
                                    <span className="status-pill status-accepted">{acharya.poojas?.length || 0} Rituals</span>
                                </td>
                                <td>
                                    <div className="table-actions-modern">
                                        <button onClick={() => openEditModal(acharya)} className="btn-edit-modern">Edit</button>
                                        <button onClick={() => handleDelete(acharya.id)} className="btn-delete-modern">Delete</button>
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
                        Page <strong>{currentPage}</strong> of {Math.ceil(acharyas.length / entriesPerPage) || 1}
                    </div>
                    <button 
                        className="pager-btn" 
                        disabled={currentPage >= Math.ceil(acharyas.length / entriesPerPage)} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcharyaManagementPage;
