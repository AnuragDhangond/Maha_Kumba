import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { safetyResourceService } from '../../api/services/safetyResourceService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { safetyResourceSchema } from '../../schemas/healthSafetySchemas';
import { scrollAndFocusError } from '../../utils/validationUtils';
import '../../styles/DashboardForms.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelected }) => {
    useMapEvents({
        click(e) {
            onLocationSelected(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const SafetyResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingResource, setEditingResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const entriesPerPage = 10;
    
    const initialFormState = {
        name: '', type: 'POLICE', address: '', contact: '', latitude: 20.0075, longitude: 73.7898, status: 'Active'
    };
    
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(safetyResourceSchema),
        mode: 'onTouched',
        defaultValues: initialFormState
    });

    const lat = watch('latitude') ?? 20.0075;
    const lng = watch('longitude') ?? 73.7898;

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResources();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchResources = async () => {
        try {
            setError('');
            const response = await safetyResourceService.getAllResources(currentPage - 1, entriesPerPage, searchTerm);
            const data = response.data;
            setResources(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (fetchError) {
            console.error('Error fetching resources:', fetchError);
            setError('Unable to load resources from the backend.');
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const onSubmitForm = async (data) => {
        try {
            if (editingResource) {
                await safetyResourceService.updateResource(editingResource.id, data);
                Swal.fire('Updated', 'Resource updated successfully.', 'success');
            } else {
                await safetyResourceService.createResource(data);
                Swal.fire('Created', 'New resource added.', 'success');
            }
            resetForm();
            fetchResources();
        } catch (submitError) {
            Swal.fire('Error', 'Action failed.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ 
            title: 'Delete Resource?', 
            text: 'This action cannot be undone.',
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#ff5252',
            confirmButtonText: 'Yes, Delete it!'
        });
        if (result.isConfirmed) {
            try {
                await safetyResourceService.deleteResource(id);
                fetchResources();
                Swal.fire('Deleted!', 'Resource has been removed.', 'success');
            } catch (deleteError) {
                console.error(deleteError);
                Swal.fire('Error', 'Failed to delete resource.', 'error');
            }
        }
    };

    const resetForm = () => {
        setEditingResource(null);
        reset(initialFormState);
    };

    const handleLocationSelected = (latVal, lngVal) => {
        setValue('latitude', latVal, { shouldValidate: true, shouldDirty: true });
        setValue('longitude', lngVal, { shouldValidate: true, shouldDirty: true });
    };

    const nashikBounds = [[19.92, 73.72], [20.08, 73.88]];

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Safety Resources Management</h1>
                </div>
            </div>

            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingResource ? 'Edit Resource Details' : 'Register New Safety Point'}</h3>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>
                        Fill details and click on the map to set exact coordinates.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.name ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Resource Name <span className="required-mark">*</span></label>
                            <input type="text" {...register('name')} className={`form-input-modern ${errors.name ? 'has-error' : ''}`} placeholder="e.g. Ram Kund Police Post" />
                            {errors.name && <div className="form-error-message">{errors.name.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.type ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Type <span className="required-mark">*</span></label>
                            <select {...register('type')} className={`form-select-modern ${errors.type ? 'has-error' : ''}`}>
                                <option value="POLICE">Police Station / Post</option>
                                <option value="FIRE">Fire Response Unit</option>
                                <option value="CAMP">Medical / Health Camp</option>
                                <option value="CONTROL_ROOM">Mela Control Room</option>
                            </select>
                            {errors.type && <div className="form-error-message">{errors.type.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.contact ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Contact Number <span className="required-mark">*</span></label>
                            <input type="text" {...register('contact')} className={`form-input-modern ${errors.contact ? 'has-error' : ''}`} placeholder="e.g. 100 or 1077" />
                            {errors.contact && <div className="form-error-message">{errors.contact.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.status ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Status <span className="required-mark">*</span></label>
                            <select {...register('status')} className={`form-select-modern ${errors.status ? 'has-error' : ''}`}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Full">Full (For Camps)</option>
                            </select>
                            {errors.status && <div className="form-error-message">{errors.status.message}</div>}
                        </div>
                        <div className={`form-group-modern form-span-2 ${errors.address ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Area / Address <span className="required-mark">*</span></label>
                            <input type="text" {...register('address')} className={`form-input-modern ${errors.address ? 'has-error' : ''}`} placeholder="e.g. Near Ram Kund Main Entrance" />
                            {errors.address && <div className="form-error-message">{errors.address.message}</div>}
                        </div>
                        
                        <div className="form-group-modern form-span-2" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
                            <label className="form-label-modern" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '4px 8px', borderRadius: '4px', margin: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '0.8rem', maxWidth: 'calc(100% - 20px)', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                Click on map to set location<br/>(Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)})
                            </label>
                            <MapContainer 
                                center={[lat, lng]} 
                                zoom={14} 
                                style={{ height: '100%', width: '100%' }}
                                maxBounds={nashikBounds}
                                attributionControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                <LocationPicker onLocationSelected={handleLocationSelected} />
                                <Marker position={[lat, lng]} />
                            </MapContainer>
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingResource ? 'Update Resource' : 'Register Resource'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(46, 125, 50, 0.08)' }}><div className="marker-inner" style={{ background: '#2E7D32' }}></div></div>
                    <div><h2 className="title-static">Safety Network</h2><span className="subtitle-static">Dynamic Resource Registry</span></div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #2E7D32' }}>
                        <div className="m-vals"><span className="digit">{totalElements}</span><span className="lab">Active Points</span></div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search by name, type, status or address..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input-modern"
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            </div>

            {error && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#fff1f2', color: '#be123c' }}>
                    {error}
                </div>
            )}

            <div className="table-wrapper-premium">
                <table className="admin-table">
                    <thead><tr><th>ID</th><th>Name & Contact</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {!loading && resources.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#795d4d' }}>
                                    No resources found.
                                </td>
                            </tr>
                        ) : resources.map((res) => (
                            <tr key={res.id}>
                                <td><span className="id-badge-alt">S-{res.id}</span></td>
                                <td><div className="font-semibold">{res.name}</div><div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{res.contact}</div></td>
                                <td><span className="status-pill status-accepted">{res.type}</span></td>
                                <td><div>{res.address}</div><div style={{ fontSize: '0.75rem', color: '#795d4d' }}>{res.latitude.toFixed(4)}, {res.longitude.toFixed(4)}</div></td>
                                <td><span className={`status-pill status-${res.status.toLowerCase() === 'active' ? 'completed' : 'failed'}`}>{res.status}</span></td>
                                <td>
                                    <div className="table-actions-modern">
                                        <button
                                            onClick={() => {
                                                setEditingResource(res);
                                                reset(res);
                                                document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="btn-edit-modern"
                                        >
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(res.id)} className="btn-delete-modern">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-bar-premium">
                <button className="pager-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>Previous</button>
                <div className="pager-info">Page <strong>{currentPage}</strong> of {totalPages}</div>
                <button className="pager-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>Next</button>
            </div>
        </div>
    );
};

export default SafetyResourcesPage;
