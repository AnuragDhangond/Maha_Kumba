import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { hospitalService } from '../../api/services/hospitalService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hospitalSchema } from '../../schemas/healthSafetySchemas';
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

const HospitalsPage = () => {
    const [hospitals, setHospitals] = useState([]);
    const [hospitalsCurrentPage, setHospitalsCurrentPage] = useState(1);
    const [hospitalTotalPages, setHospitalTotalPages] = useState(1);
    const [hospitalTotalElements, setHospitalTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingHospital, setEditingHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const entriesPerPage = 10;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(hospitalSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '', address: '', latitude: 20.0075, longitude: 73.7898, contact: '', beds: 0, status: 'Active'
        }
    });

    const { onChange: bedsOnChange, ...bedsRegister } = register('beds');

    const lat = watch('latitude') ?? 20.0075;
    const lng = watch('longitude') ?? 73.7898;

    const watchedName = watch('name');
    const watchedContact = watch('contact');

    // Validation states for real-time check
    const [nameStatus, setNameStatus] = useState({ message: '', available: null });
    const [contactStatus, setContactStatus] = useState({ message: '', available: null });

    // Validate Name
    useEffect(() => {
        const validate = async () => {
            if (!watchedName || editingHospital) {
                setNameStatus({ message: '', available: null });
                return;
            }
            try {
                const data = await hospitalService.checkName(watchedName);
                setNameStatus({ message: data.message, available: !data.exists });
            } catch (err) { console.error(err); }
        };
        const timer = setTimeout(validate, 500);
        return () => clearTimeout(timer);
    }, [watchedName, editingHospital]);

    // Validate Contact
    useEffect(() => {
        const validate = async () => {
            if (!watchedContact || editingHospital) {
                setContactStatus({ message: '', available: null });
                return;
            }
            try {
                const data = await hospitalService.checkContact(watchedContact);
                setContactStatus({ message: data.message, available: !data.exists });
            } catch (err) { console.error(err); }
        };
        const timer = setTimeout(validate, 500);
        return () => clearTimeout(timer);
    }, [watchedContact, editingHospital]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHospitals();
        }, 300);
        return () => clearTimeout(timer);
    }, [hospitalsCurrentPage, searchTerm]);

    useEffect(() => {
        setHospitalsCurrentPage(1);
    }, [searchTerm]);

    const fetchHospitals = async () => {
        try {
            setError('');
            const response = await hospitalService.getAllHospitals(hospitalsCurrentPage - 1, entriesPerPage, searchTerm);
            const data = response.data;
            setHospitals(data.content || []);
            setHospitalTotalPages(data.totalPages || 1);
            setHospitalTotalElements(data.totalElements || 0);
        } catch (fetchError) {
            console.error('Error fetching hospitals:', fetchError);
            setError('Unable to load hospitals from the backend.');
            setHospitals([]);
        } finally {
            setLoading(false);
        }
    };

    const onSubmitHospital = async (data) => {
        try {
            const dataToSubmit = {
                ...data,
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                beds: parseInt(data.beds, 10)
            };
            if (editingHospital) {
                await hospitalService.updateHospital(editingHospital.id, dataToSubmit);
                Swal.fire('Updated', 'Hospital updated successfully.', 'success');
            } else {
                await hospitalService.createHospital(dataToSubmit);
                Swal.fire('Created', 'New hospital added.', 'success');
            }
            resetForm();
            fetchHospitals();
        } catch (submitError) {
            console.error(submitError);
            let errorMsg = 'Action failed.';
            if (submitError.response?.data) {
                const responseData = submitError.response.data;
                if (responseData.errors && typeof responseData.errors === 'object') {
                    errorMsg = Object.values(responseData.errors).join(', ');
                } else if (responseData.message) {
                    errorMsg = responseData.message;
                }
            }
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    const handleHospitalDelete = async (id) => {
        const result = await Swal.fire({ 
            title: 'Deactivate Hospital?', 
            text: 'This will mark the hospital as INACTIVE.',
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#ff5252' 
        });
        if (result.isConfirmed) {
            try {
                await hospitalService.deleteHospital(id);
                fetchHospitals();
            } catch (deleteError) {
                console.error(deleteError);
            }
        }
    };

    const resetForm = () => {
        setEditingHospital(null);
        reset({ name: '', address: '', latitude: 20.0075, longitude: 73.7898, contact: '', beds: 0, status: 'Active' });
        setNameStatus({ message: '', available: null });
        setContactStatus({ message: '', available: null });
    };

    const handleLocationSelected = (latVal, lngVal) => {
        setValue('latitude', latVal, { shouldValidate: true, shouldDirty: true });
        setValue('longitude', lngVal, { shouldValidate: true, shouldDirty: true });
    };

    const nashikBounds = [[19.92, 73.72], [20.08, 73.88]];

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '30px' }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Healthcare Grid</h1>
                </div>
            </div>

            <div className="dashboard-form-container">
                <div className="form-header-modern">
                    <h3>{editingHospital ? 'Edit Hospital Location' : 'Register New Medical Center'}</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitHospital, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.name ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Hospital Name <span className="required-mark">*</span></label>
                            <input 
                                type="text" 
                                {...register('name')} 
                                className={`form-input-modern ${errors.name ? 'has-error' : ''} ${nameStatus.available === false ? 'input-error' : nameStatus.available === true ? 'input-success' : ''}`} 
                                placeholder="e.g. Civil Hospital" 
                            />
                            {errors.name && <div className="form-error-message">{errors.name.message}</div>}
                            {nameStatus.message && (
                                <div style={{ fontSize: '11px', marginTop: '4px', color: nameStatus.available ? '#4caf50' : '#ff5252', fontWeight: '500' }}>
                                    {nameStatus.available ? '✓ ' : '✕ '} {nameStatus.message}
                                </div>
                            )}
                        </div>
                        <div className={`form-group-modern ${errors.contact ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Contact Number <span className="required-mark">*</span></label>
                            <input 
                                type="text" 
                                {...register('contact')} 
                                className={`form-input-modern ${errors.contact ? 'has-error' : ''} ${contactStatus.available === false ? 'input-error' : contactStatus.available === true ? 'input-success' : ''}`} 
                                placeholder="e.g. 108" 
                            />
                            {errors.contact && <div className="form-error-message">{errors.contact.message}</div>}
                            {contactStatus.message && (
                                <div style={{ fontSize: '11px', marginTop: '4px', color: contactStatus.available ? '#4caf50' : '#ff5252', fontWeight: '500' }}>
                                    {contactStatus.available ? '✓ ' : '✕ '} {contactStatus.message}
                                </div>
                            )}
                        </div>
                        <div className={`form-group-modern ${errors.beds ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Available Beds <span className="required-mark">*</span></label>
                            <input 
                                type="text" 
                                {...bedsRegister} 
                                onChange={(e) => {
                                    let val = e.target.value;
                                    val = val.replace(/[^0-9]/g, '');
                                    e.target.value = val;
                                    bedsOnChange(e);
                                }}
                                className={`form-input-modern ${errors.beds ? 'has-error' : ''}`} 
                                placeholder="e.g. 45" 
                            />
                            {errors.beds && <div className="form-error-message">{errors.beds.message}</div>}
                        </div>
                        <div className={`form-group-modern form-span-2 ${errors.address ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Area / Address <span className="required-mark">*</span></label>
                            <input type="text" {...register('address')} className={`form-input-modern ${errors.address ? 'has-error' : ''}`} placeholder="e.g. Ram Kund" />
                            {errors.address && <div className="form-error-message">{errors.address.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.status ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Status <span className="required-mark">*</span></label>
                            <select {...register('status')} className={`form-select-modern ${errors.status ? 'has-error' : ''}`}>
                                <option value="Active">Active</option>
                                <option value="Full">Full</option>
                                <option value="Closed">Closed</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            {errors.status && <div className="form-error-message">{errors.status.message}</div>}
                        </div>
                        <div className="form-group-modern form-span-2" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
                            <label className="form-label-modern" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '4px 8px', borderRadius: '4px', margin: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '0.8rem', maxWidth: 'calc(100% - 20px)', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                Click on map to set location<br/>(Lat: {parseFloat(lat || 20.0075).toFixed(4)}, Lng: {parseFloat(lng || 73.7898).toFixed(4)})
                            </label>
                            <MapContainer 
                                center={[parseFloat(lat || 20.0075), parseFloat(lng || 73.7898)]} 
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
                                <Marker position={[parseFloat(lat || 20.0075), parseFloat(lng || 73.7898)]} />
                            </MapContainer>
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">
                            {editingHospital ? 'Update Hospital' : 'Register Hospital'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-dashboard-secondary">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(3, 169, 244, 0.08)' }}><div className="marker-inner" style={{ background: '#03A9F4' }}></div></div>
                    <div><h2 className="title-static">Live Healthcare Grid</h2><span className="subtitle-static">Hospital network</span></div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #03A9F4' }}>
                        <div className="m-vals"><span className="digit">{hospitalTotalElements}</span><span className="lab">Active Clinics</span></div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search hospitals by name, contact, status or address..." 
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
                    <thead><tr><th>ID</th><th>Name & Contact</th><th>Location</th><th>Beds</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {!loading && hospitals.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#795d4d' }}>
                                    No hospitals found matching your search.
                                </td>
                            </tr>
                        ) : hospitals.map((hospital) => (
                            <tr key={hospital.id}>
                                <td><span className="id-badge-alt">H-{hospital.id}</span></td>
                                <td><div className="font-semibold">{hospital.name}</div><div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{hospital.contact}</div></td>
                                <td><div>{hospital.address}</div><div style={{ fontSize: '0.75rem', color: '#795d4d' }}>{hospital.latitude}, {hospital.longitude}</div></td>
                                <td className="font-bold text-accent">{hospital.beds}</td>
                                <td><span className={`status-pill status-${hospital.status.toLowerCase() === 'full' || hospital.status.toLowerCase() === 'closed' || hospital.status.toLowerCase() === 'inactive' ? 'failed' : 'completed'}`}>{hospital.status}</span></td>
                                <td>
                                    <div className="table-actions-modern">
                                        <button
                                            onClick={() => {
                                                setEditingHospital(hospital);
                                                reset(hospital);
                                                document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="btn-edit-modern"
                                        >
                                            Edit
                                        </button>
                                        <button onClick={() => handleHospitalDelete(hospital.id)} className="btn-delete-modern">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-bar-premium">
                <button className="pager-btn" disabled={hospitalsCurrentPage === 1} onClick={() => setHospitalsCurrentPage((prev) => prev - 1)}>Previous</button>
                <div className="pager-info">Page <strong>{hospitalsCurrentPage}</strong> of {hospitalTotalPages}</div>
                <button className="pager-btn" disabled={hospitalsCurrentPage >= hospitalTotalPages} onClick={() => setHospitalsCurrentPage((prev) => prev + 1)}>Next</button>
            </div>
        </div>
    );
};

export default HospitalsPage;
