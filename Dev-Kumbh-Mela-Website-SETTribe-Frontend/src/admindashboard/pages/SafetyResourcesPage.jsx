import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { safetyResourceService } from '../../api/services/safetyResourceService';
import Swal from 'sweetalert2';
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
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const entriesPerPage = 10;
    
    const initialFormState = {
        name: '', type: 'POLICE', address: '', contact: '', latitude: 20.0075, longitude: 73.7898, status: 'Active'
    };
    
    const [formData, setFormData] = useState(initialFormState);

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

    const handleSubmit = async (e) => {
        const form = e.currentTarget;
        e.preventDefault();

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);
        try {
            if (editingResource) {
                await safetyResourceService.updateResource(editingResource.id, formData);
                Swal.fire('Updated', 'Resource updated successfully.', 'success');
            } else {
                await safetyResourceService.createResource(formData);
                Swal.fire('Created', 'New resource added.', 'success');
            }
            resetForm();
            fetchResources();
        } catch (submitError) {
            console.error(submitError);
            let errorMsg = 'Action failed.';
            if (submitError.response?.data) {
                const data = submitError.response.data;
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
        setFormData(initialFormState);
        setValidated(false);
    };

    const handleLocationSelected = (lat, lng) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
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
                <form className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate onSubmit={handleSubmit}>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Resource Name <span className="required-mark">*</span></label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input-modern" required placeholder="e.g. Ram Kund Police Post" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Type <span className="required-mark">*</span></label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="form-select-modern" required>
                                <option value="POLICE">Police Station / Post</option>
                                <option value="FIRE">Fire Response Unit</option>
                                <option value="CAMP">Medical / Health Camp</option>
                                <option value="CONTROL_ROOM">Mela Control Room</option>
                            </select>
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Contact Number <span className="required-mark">*</span></label>
                            <input type="text" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="form-input-modern" required placeholder="e.g. 100 or 1077" />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Status <span className="required-mark">*</span></label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="form-select-modern" required>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Full">Full (For Camps)</option>
                            </select>
                        </div>
                        <div className="form-group-modern form-span-2">
                            <label className="form-label-modern">Area / Address <span className="required-mark">*</span></label>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="form-input-modern" required placeholder="e.g. Near Ram Kund Main Entrance" />
                        </div>
                        
                        <div className="form-group-modern form-span-2" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
                            <label className="form-label-modern" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '4px 8px', borderRadius: '4px', margin: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '0.8rem', maxWidth: 'calc(100% - 20px)', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                Click on map to set location<br/>(Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)})
                            </label>
                            <MapContainer 
                                center={[formData.latitude, formData.longitude]} 
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
                                <Marker position={[formData.latitude, formData.longitude]} />
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
                                                setFormData(res);
                                                setValidated(false);
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
