import React, { useState, useEffect, useRef } from 'react';
import shopService from '../../services/shopService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getArtisanSchema } from '../../../schemas/shopSchemas';
import { scrollAndFocusError } from '../../../utils/validationUtils';
import '../../../styles/DashboardForms.css';

const ArtisanManagement = () => {
    const [artisans, setArtisans] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const entriesPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(getArtisanSchema(!!editingItem)),
        mode: 'onTouched',
        defaultValues: {
            artisanName: '',
            craft: '',
            region: '',
            description: '',
            isActive: true,
            image: null
        }
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const fetchArtisans = async () => {
        try {
            const params = {
                page: currentPage - 1,
                size: entriesPerPage,
                search: searchTerm || undefined,
                sortBy: sortConfig.key,
                direction: sortConfig.direction
            };
            const res = await shopService.getAllArtisansOperator(params);
            setArtisans(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchArtisans();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, sortConfig]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const onSubmitForm = async (data) => {
        const { image, ...cleanFormData } = data;
        const formDataPayload = new FormData();
        const body = { ...cleanFormData, id: editingItem?.id || null };
        const artisanBlob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        formDataPayload.append('artisan', artisanBlob);
        if (image && image.length > 0) {
            formDataPayload.append('image', image[0]);
        }

        setIsLoading(true);
        try {
            if (editingItem) {
                await shopService.updateArtisan(editingItem.id, formDataPayload);
                Swal.fire('Updated!', 'Artisan profile has been updated.', 'success');
            } else {
                await shopService.createArtisan(formDataPayload);
                Swal.fire('Created!', 'New artisan profile has been added.', 'success');
            }
            fetchArtisans();
            closeForm();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to save artisan profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (artisan) => {
        setEditingItem(artisan);
        reset({
            artisanName: artisan.artisanName || '',
            craft: artisan.craft || '',
            region: artisan.region || '',
            description: artisan.description || '',
            isActive: artisan.isActive ?? true,
            image: null
        });
        document.getElementById('artisan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete this artisan?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            await shopService.deleteArtisan(id);
            fetchArtisans();
            Swal.fire('Deleted!', 'The artisan has been deleted.', 'success');
        }
    };

    const closeForm = () => {
        setEditingItem(null);
        reset({
            artisanName: '',
            craft: '',
            region: '',
            description: '',
            isActive: true,
            image: null
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Artisan Management</h1>
                </div>
                {editingItem && (
                    <button onClick={closeForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Edit</button>
                )}
            </div>

            {/* Management Form */}
            <div id="artisan-form" className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingItem ? 'Edit Artisan' : 'Add New Artisan'}</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.artisanName ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Artisan Name <span className="required-mark">*</span></label>
                            <input type="text" {...register('artisanName')} className={`form-input-modern ${errors.artisanName ? 'has-error' : ''}`} placeholder="e.g. Ramesh Kumar" />
                            {errors.artisanName && <div className="form-error-message">{errors.artisanName.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.craft ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Craft <span className="required-mark">*</span></label>
                            <input type="text" {...register('craft')} className={`form-input-modern ${errors.craft ? 'has-error' : ''}`} placeholder="e.g. Wood Carving" />
                            {errors.craft && <div className="form-error-message">{errors.craft.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.region ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Region <span className="required-mark">*</span></label>
                            <input type="text" {...register('region')} className={`form-input-modern ${errors.region ? 'has-error' : ''}`} placeholder="e.g. Nashik" />
                            {errors.region && <div className="form-error-message">{errors.region.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.image ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Artisan Photo {!editingItem && <span className="required-mark">*</span>}</label>
                            <input type="file" {...register('image')} ref={(e) => { register('image').ref(e); fileInputRef.current = e; }} className={`form-input-modern ${errors.image ? 'has-error' : ''}`} accept="image/jpeg,image/png,image/webp" />
                            {errors.image && <div className="form-error-message">{errors.image.message}</div>}
                            <small style={{ color: '#718096', fontSize: '0.8rem' }}>Max 10MB (JPG, PNG, WebP)</small>
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status</label>
                            <select {...register('isActive')} className="form-select-modern">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <div className={`form-group-modern form-span-3 ${errors.description ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Description</label>
                            <textarea {...register('description')} className={`form-input-modern ${errors.description ? 'has-error' : ''}`} rows="3" placeholder="Artisan background, family tradition..."></textarea>
                            {errors.description && <div className="form-error-message">{errors.description.message}</div>}
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary" disabled={isLoading}>
                            {editingItem ? 'Update Artisan' : 'Save Artisan'}
                        </button>
                        <button type="button" onClick={closeForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>



            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(76, 175, 80, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#4CAF50' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Artisans Directory</h2>
                        <span className="subtitle-static">Maha Kumbh • Master Craftsmen & Artisans</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4CAF50' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Profiles</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search by artisan name, craft, region, or status (Active/Inactive)..." 
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
                            <th onClick={() => handleSort('artisanName')} style={{ cursor: 'pointer' }}>
                                Artisan Profile {sortConfig.key === 'artisanName' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('craft')} style={{ cursor: 'pointer' }}>
                                Craft {sortConfig.key === 'craft' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('region')} style={{ cursor: 'pointer' }}>
                                Region {sortConfig.key === 'region' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {artisans.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No artisans found.</td></tr>
                        ) : (
                            artisans.map(a => (
                                <tr key={a.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {a.imageUrl ? (
                                                <img src={a.imageUrl.startsWith('http') ? a.imageUrl : `${shopService.API_URL}${a.imageUrl.startsWith('/') ? '' : '/'}${a.imageUrl}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧑‍</div>
                                            )}
                                            <div style={{ fontWeight: '800' }}>{a.artisanName}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700', color: '#ff7e36' }}>{a.craft}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{a.region}</div>
                                    </td>
                                    <td>
                                        <span className={`status-pill status-${a.isActive ? 'resolved' : 'pending'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => handleEdit(a)} className="btn-edit-modern">
                                                {editingItem?.id === a.id ? 'Editing...' : 'Edit'}
                                            </button>
                                            <button onClick={() => handleDelete(a.id)} className="btn-delete-modern">Delete</button>
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

export default ArtisanManagement;
