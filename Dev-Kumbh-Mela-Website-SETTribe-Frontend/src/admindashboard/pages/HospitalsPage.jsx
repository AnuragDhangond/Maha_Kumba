import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { hospitalService } from '../../api/services/hospitalService';
import { healthTipService } from '../../api/services/healthTipService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hospitalSchema, healthTipSchema } from '../../schemas/healthSafetySchemas';
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
    const [activeTab, setActiveTab] = useState('hospitals');

    // --- Hospital State ---
    const [hospitals, setHospitals] = useState([]);
    const [hospitalsCurrentPage, setHospitalsCurrentPage] = useState(1);
    const [hospitalTotalPages, setHospitalTotalPages] = useState(1);
    const [hospitalTotalElements, setHospitalTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingHospital, setEditingHospital] = useState(null);
    const entriesPerPage = 10;

    const {
        register: registerHospital,
        handleSubmit: handleSubmitHospital,
        reset: resetHospital,
        setValue: setHospitalValue,
        watch: watchHospital,
        formState: { errors: hospitalErrors }
    } = useForm({
        resolver: zodResolver(hospitalSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '', address: '', latitude: 20.0075, longitude: 73.7898, contact: '', beds: 0, status: 'Active'
        }
    });

    const hospitalLat = watchHospital('latitude') ?? 20.0075;
    const hospitalLng = watchHospital('longitude') ?? 73.7898;

    const watchedName = watchHospital('name');
    const watchedContact = watchHospital('contact');
    const watchedLatitude = watchHospital('latitude');
    const watchedLongitude = watchHospital('longitude');

    // Validation states
    const [nameStatus, setNameStatus] = useState({ message: '', available: null });
    const [contactStatus, setContactStatus] = useState({ message: '', available: null });
    const [latStatus, setLatStatus] = useState({ message: '', available: null });
    const [lonStatus, setLonStatus] = useState({ message: '', available: null });

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
            // 1. Reset if empty
            if (!watchedContact || watchedContact.length === 0) {
                setContactStatus({ message: '', available: null });
                return;
            }

            // 2. Format validation (3-15 digits/plus)
            const isValidFormat = /^[0-9+]{3,15}$/.test(watchedContact);

            if (!isValidFormat) {
                setContactStatus({ 
                    message: 'Must be 3-15 digits (only numbers and + allowed)', 
                    available: null // Clear availability status
                });
                return;
            }

            try {
                if (editingHospital) {
                    setContactStatus({ message: '', available: null });
                    return;
                }

                const data = await hospitalService.checkContact(watchedContact);
                setContactStatus({ message: data.message, available: !data.exists });
            } catch (err) { 
                console.error(err); 
                setContactStatus({ message: 'Error checking availability', available: null });
            }
        };

        const timer = setTimeout(validate, 500);
        return () => clearTimeout(timer);
    }, [watchedContact, editingHospital]);

    // Validate Latitude
    useEffect(() => {
        const validate = async () => {
            if (!watchedLatitude || editingHospital || isNaN(parseFloat(watchedLatitude))) {
                setLatStatus({ message: '', available: null });
                return;
            }
            try {
                const data = await hospitalService.checkLatitude(parseFloat(watchedLatitude));
                setLatStatus({ message: data.message, available: !data.exists });
            } catch (err) { console.error(err); }
        };
        const timer = setTimeout(validate, 500);
        return () => clearTimeout(timer);
    }, [watchedLatitude, editingHospital]);

    // Validate Longitude
    useEffect(() => {
        const validate = async () => {
            if (!watchedLongitude || editingHospital || isNaN(parseFloat(watchedLongitude))) {
                setLonStatus({ message: '', available: null });
                return;
            }
            try {
                const data = await hospitalService.checkLongitude(parseFloat(watchedLongitude));
                setLonStatus({ message: data.message, available: !data.exists });
            } catch (err) { console.error(err); }
        };
        const timer = setTimeout(validate, 500);
        return () => clearTimeout(timer);
    }, [watchedLongitude, editingHospital]);

    // --- Health Tips State ---
    const [tips, setTips] = useState([]);
    const [editingTip, setEditingTip] = useState(null);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const {
        register: registerTip,
        handleSubmit: handleSubmitTip,
        reset: resetTip,
        setValue: setTipValue,
        watch: watchTip,
        formState: { errors: tipErrors }
    } = useForm({
        resolver: zodResolver(healthTipSchema),
        mode: 'onTouched',
        defaultValues: {
            category: 'HEALTH', tipText: '', image: null
        }
    });

    const watchedTipCategory = watchTip('category');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'hospitals') fetchHospitals();
        }, 300);
        return () => clearTimeout(timer);
    }, [hospitalsCurrentPage, searchTerm, activeTab]);

    useEffect(() => {
        setHospitalsCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchTips();
    }, []);

    useEffect(() => {
        const scrollContainer = document.querySelector('.admin-content');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }, [activeTab]);

    const fetchHospitals = async () => {
        try {
            const response = await hospitalService.getAllHospitals(hospitalsCurrentPage - 1, entriesPerPage, searchTerm);
            const data = response.data;
            setHospitals(data.content || []);
            setHospitalTotalPages(data.totalPages || 1);
            setHospitalTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching hospitals:", error);
            setHospitals([]);
        }
    };

    const fetchTips = async () => {
        try {
            const response = await healthTipService.getAllTips();
            setTips(response.data);
        } catch (error) {
            console.error("Error fetching tips:", error);
            setTips([]);
        }
    };

    const handleHospitalReset = () => {
        setEditingHospital(null);
        resetHospital({ name: '', address: '', latitude: 20.0075, longitude: 73.7898, contact: '', beds: 0, status: 'Active' });
        setNameStatus({ message: '', available: null });
        setContactStatus({ message: '', available: null });
        setLatStatus({ message: '', available: null });
        setLonStatus({ message: '', available: null });
    };

    const handleLocationSelected = (lat, lng) => {
        setHospitalValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
        setHospitalValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
    };

    const nashikBounds = [[19.92, 73.72], [20.08, 73.88]];

    const onSubmitHospital = async (data) => {
        try {
            const dataToSubmit = {
                ...data,
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                beds: parseInt(data.beds)
            };
            if (editingHospital) {
                await hospitalService.updateHospital(editingHospital.id, dataToSubmit);
                Swal.fire('Updated!', 'Hospital updated successfully.', 'success');
            } else {
                await hospitalService.createHospital(dataToSubmit);
                Swal.fire('Created!', 'New Hospital added.', 'success');
            }
            handleHospitalReset();
            fetchHospitals();
        } catch (error) {
            console.error(error);
            let errorMsg = 'Action failed.';
            if (error.response?.data) {
                const responseData = error.response.data;
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
        const result = await Swal.fire({ title: 'Deactivate Hospital?', text: 'This will mark the hospital as INACTIVE.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try { await hospitalService.deleteHospital(id); fetchHospitals(); } catch (error) { console.error(error); }
        }
    };

    const handleTipReset = () => {
        setEditingTip(null);
        resetTip({ category: 'HEALTH', tipText: '', image: null });
        setIsNewCategory(false);
        setSelectedImage(null);
    };

    const onSubmitTip = async (data) => {
        try {
            const dataToSubmit = {
                category: data.category,
                tipText: data.tipText,
                imagePath: editingTip?.imagePath || ''
            };
            if (editingTip) {
                await healthTipService.updateTip(editingTip.id, dataToSubmit, selectedImage);
                Swal.fire('Updated!', 'Advisory updated.', 'success');
            } else {
                await healthTipService.createTip(dataToSubmit, selectedImage);
                Swal.fire('Created!', 'New Advisory added.', 'success');
            }
            handleTipReset();
            fetchTips();
        } catch (error) {
            console.error("Submission Error:", error);
            let errorMsg = 'Action failed.';
            if (error.response?.data) {
                const responseData = error.response.data;
                if (responseData.errors && typeof responseData.errors === 'object') {
                    errorMsg = Object.values(responseData.errors).join(', ');
                } else if (responseData.message) {
                    errorMsg = responseData.message;
                }
            }
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    const handleTipDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff5252' });
        if (result.isConfirmed) {
            try { await healthTipService.deleteTip(id); fetchTips(); } catch (error) { console.error(error); }
        }
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Healthcare & Safety Hub</h1>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="admin-tabs-scrollable">
                <button 
                    onClick={() => setActiveTab('hospitals')}
                    className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
                >
                    Hospitals
                </button>
                <button 
                    onClick={() => setActiveTab('tips')}
                    className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
                >
                    Health Tips
                </button>
            </div>

            {activeTab === 'hospitals' ? (
                <>
                    {/* --- HOSPITAL MANAGEMENT VIEW --- */}
                    <div className="dashboard-form-container">
                        <div className="form-header-modern">
                            <h3>{editingHospital ? 'Edit Hospital Location' : 'Register New Medical Center'}</h3>
                        </div>
                        <form onSubmit={handleSubmitHospital(onSubmitHospital, scrollAndFocusError)}>
                            <div className="form-grid-modern">
                                <div className={`form-group-modern ${hospitalErrors.name ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Hospital Name <span className="required-mark">*</span></label>
                                    <input 
                                        type="text" 
                                        {...registerHospital('name')} 
                                        onKeyDown={(e) => {
                                            if (!/[A-Za-z\s]/.test(e.key) && 
                                                !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`form-input-modern ${hospitalErrors.name ? 'has-error' : ''} ${nameStatus.available === false ? 'input-error' : nameStatus.available === true ? 'input-success' : ''}`} 
                                        placeholder="e.g. Civil Hospital" 
                                    />
                                    {hospitalErrors.name && <div className="form-error-message">{hospitalErrors.name.message}</div>}
                                    {nameStatus.message && (
                                        <div style={{ fontSize: '11px', marginTop: '4px', color: nameStatus.available ? '#4caf50' : '#ff5252', fontWeight: '500' }}>
                                            {nameStatus.available ? '✓ ' : '✕ '} {nameStatus.message}
                                        </div>
                                    )}
                                </div>

                                <div className={`form-group-modern ${hospitalErrors.contact ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Contact Number <span className="required-mark">*</span></label>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        {...registerHospital('contact')} 
                                        maxLength="15"
                                        onKeyDown={(e) => {
                                            // Allow digits and plus sign
                                            if (!/[0-9+]/.test(e.key) && 
                                                !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`form-input-modern ${hospitalErrors.contact ? 'has-error' : ''} ${contactStatus.available === false ? 'input-error' : contactStatus.available === true ? 'input-success' : ''}`} 
                                        placeholder="Enter contact number" 
                                    />
                                    {hospitalErrors.contact && <div className="form-error-message">{hospitalErrors.contact.message}</div>}
                                    {contactStatus.message && (
                                        <div style={{ fontSize: '11px', marginTop: '4px', color: contactStatus.available ? '#4caf50' : '#ff5252', fontWeight: '500' }}>
                                            {contactStatus.available ? '✓ ' : '✕ '} {contactStatus.message}
                                        </div>
                                    )}
                                </div>

                                <div className={`form-group-modern ${hospitalErrors.beds ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Available Beds <span className="required-mark">*</span></label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        {...registerHospital('beds')} 
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && 
                                                !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`form-input-modern ${hospitalErrors.beds ? 'has-error' : ''}`} 
                                        placeholder="e.g. 45" 
                                    />
                                    {hospitalErrors.beds && <div className="form-error-message">{hospitalErrors.beds.message}</div>}
                                </div>

                                <div className={`form-group-modern ${hospitalErrors.address ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Area / Address <span className="required-mark">*</span></label>
                                    <input type="text" {...registerHospital('address')} className={`form-input-modern ${hospitalErrors.address ? 'has-error' : ''}`} placeholder="e.g. Ram Kund" />
                                    {hospitalErrors.address && <div className="form-error-message">{hospitalErrors.address.message}</div>}
                                </div>

                                <div className={`form-group-modern ${hospitalErrors.status ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Status <span className="required-mark">*</span></label>
                                    <select {...registerHospital('status')} className={`form-select-modern ${hospitalErrors.status ? 'has-error' : ''}`}>
                                        <option value="Active">Active</option>
                                        <option value="Full">Full</option>
                                        <option value="Closed">Closed</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                    {hospitalErrors.status && <div className="form-error-message">{hospitalErrors.status.message}</div>}
                                </div>

                                <div className="form-group-modern form-span-2" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
                                    <label className="form-label-modern" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '4px 8px', borderRadius: '4px', margin: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '0.8rem', maxWidth: 'calc(100% - 20px)', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                        Click on map to set location<br/>(Lat: {parseFloat(hospitalLat || 20.0075).toFixed(4)}, Lng: {parseFloat(hospitalLng || 73.7898).toFixed(4)})
                                    </label>
                                    <MapContainer 
                                        center={[parseFloat(hospitalLat || 20.0075), parseFloat(hospitalLng || 73.7898)]} 
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
                                        <Marker position={[parseFloat(hospitalLat || 20.0075), parseFloat(hospitalLng || 73.7898)]} />
                                    </MapContainer>
                                </div>
                            </div>
                            <div className="form-actions-modern">
                                <button type="submit" className="btn-dashboard-primary">
                                    {editingHospital ? 'Update Hospital' : 'Register Hospital'}
                                </button>
                                <button type="button" onClick={handleHospitalReset} className="btn-dashboard-secondary">
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="emergency-banner-static">
                        <div className="banner-context">
                            <div className="static-marker-sos" style={{ background: 'rgba(3, 169, 244, 0.08)' }}><div className="marker-inner" style={{ background: '#03A9F4' }}></div></div>
                            <div><h2 className="title-static">Live Healthcare Grid</h2><span className="subtitle-static">Nashik 2027 • Hospital Network</span></div>
                        </div>
                        <div className="banner-metrics-static">
                            <div className="metric-box-fixed" style={{ borderBottom: '3px solid #03A9F4' }}>
                                <div className="m-vals"><span className="digit">{hospitalTotalElements}</span><span className="lab">Total Clinics</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="form-filter-row">
                        <input 
                            type="text" 
                            placeholder="Search hospitals by name, contact, status or address..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input-modern"
                        />
                    </div>

                    <div className="table-wrapper-premium">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name & Contact</th>
                                    <th>Location</th>
                                    <th>Beds</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospitals.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center p-8 text-muted" style={{ color: '#888' }}>No hospitals found matching your search.</td></tr>
                                ) : (
                                    hospitals.map(h => (
                                        <tr key={h.id}>
                                            <td><span className="id-badge-alt">H-{h.id}</span></td>
                                            <td>
                                                <div className="font-semibold">{h.name}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{h.contact}</div>
                                            </td>
                                            <td>
                                                <div style={{ color: 'var(--admin-text)' }}>{h.address}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{h.latitude}, {h.longitude}</div>
                                            </td>
                                            <td className="font-bold text-accent">{h.beds}</td>
                                            <td>
                                                <span className={`status-pill status-${h.status.toLowerCase() === 'full' ? 'failed' : h.status.toLowerCase() === 'closed' ? 'failed' : h.status.toLowerCase() === 'inactive' ? 'failed' : 'completed'}`}>
                                                    {h.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions-modern">
                                                    <button onClick={() => { 
                                                        setEditingHospital(h); 
                                                        resetHospital({
                                                            name: h.name || '',
                                                            address: h.address || '',
                                                            latitude: h.latitude ?? 20.0075,
                                                            longitude: h.longitude ?? 73.7898,
                                                            contact: h.contact || '',
                                                            beds: h.beds ?? 0,
                                                            status: h.status || 'Active'
                                                        }); 
                                                        document.querySelector('.admin-content')?.scrollTo({top: 0, behavior: 'smooth'}); 
                                                    }} className="btn-edit-modern">Edit</button>
                                                    {h.status !== 'INACTIVE' && (
                                                        <button onClick={() => handleHospitalDelete(h.id)} className="btn-delete-modern">Deactivate</button>
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
                                disabled={hospitalsCurrentPage === 1} 
                                onClick={() => setHospitalsCurrentPage(prev => Math.max(1, prev - 1))}
                            >
                                Previous
                            </button>
                            <div className="pager-info">
                                Page <strong>{hospitalsCurrentPage}</strong> of {hospitalTotalPages}
                            </div>
                            <button 
                                className="pager-btn" 
                                disabled={hospitalsCurrentPage >= hospitalTotalPages} 
                                onClick={() => setHospitalsCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* --- HEALTH TIPS MANAGEMENT VIEW --- */}
                    <div className="dashboard-form-container">
                        <div className="form-header-modern">
                            <h3>{editingTip ? 'Modify Advisory' : 'Register New Advisory'}</h3>
                        </div>
                        <form onSubmit={handleSubmitTip(onSubmitTip, scrollAndFocusError)}>
                            <div className="form-grid-modern">
                                <div className={`form-group-modern ${tipErrors.category ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Category <span className="required-mark">*</span></label>
                                    <select 
                                        value={isNewCategory ? 'NEW' : watchedTipCategory} 
                                        onChange={(e) => {
                                            if (e.target.value === 'NEW') {
                                                setIsNewCategory(true);
                                                setTipValue('category', '');
                                            } else {
                                                setIsNewCategory(false);
                                                setTipValue('category', e.target.value);
                                            }
                                        }} 
                                        className={`form-select-modern ${tipErrors.category ? 'has-error' : ''}`} 
                                    >
                                        <option value="HEALTH">Health & Hygiene</option>
                                        <option value="SAFETY">Safety Advisory</option>
                                        {Array.from(new Set(tips.map(t => t.category)))
                                            .filter(cat => cat !== 'HEALTH' && cat !== 'SAFETY')
                                            .map(cat => <option key={cat} value={cat}>{cat}</option>)
                                        }
                                        <option value="NEW">+ Add New Category</option>
                                    </select>
                                    {tipErrors.category && <div className="form-error-message">{tipErrors.category.message}</div>}
                                </div>

                                {isNewCategory && (
                                    <div className={`form-group-modern ${tipErrors.category ? 'has-error' : ''}`}>
                                        <label className="form-label-modern">New Category Name <span className="required-mark">*</span></label>
                                        <input 
                                            type="text" 
                                            value={watchedTipCategory} 
                                            onChange={(e) => setTipValue('category', e.target.value.toUpperCase(), { shouldValidate: true })} 
                                            className={`form-input-modern ${tipErrors.category ? 'has-error' : ''}`} 
                                            placeholder="e.g. TRAFFIC" 
                                        />
                                        {tipErrors.category && <div className="form-error-message">{tipErrors.category.message}</div>}
                                    </div>
                                )}

                                <div className={`form-group-modern ${tipErrors.image ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Category Image {watchedTipCategory ? `(${watchedTipCategory})` : ''}</label>
                                    <input 
                                        type="file" 
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedImage(file);
                                                setTipValue('image', file, { shouldValidate: true, shouldDirty: true });
                                            }
                                        }} 
                                        className={`form-input-modern ${tipErrors.image ? 'has-error' : ''}`} 
                                        accept="image/*"
                                    />
                                    {selectedImage && (
                                        <div style={{ marginTop: '5px', fontSize: '11px', color: '#4caf50' }}>
                                            Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                                        </div>
                                    )}
                                    {tipErrors.image && <div className="form-error-message">{tipErrors.image.message}</div>}
                                    <small style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                                        Uploading a new image will update it for all tips in this category.
                                    </small>
                                </div>

                                <div className={`form-group-modern form-span-2 ${tipErrors.tipText ? 'has-error' : ''}`}>
                                    <label className="form-label-modern">Advisory Text <span className="required-mark">*</span></label>
                                    <input type="text" {...registerTip('tipText')} className={`form-input-modern ${tipErrors.tipText ? 'has-error' : ''}`} placeholder="Drink only from purified water points" />
                                    {tipErrors.tipText && <div className="form-error-message">{tipErrors.tipText.message}</div>}
                                </div>
                            </div>
                            <div className="form-actions-modern">
                                <button type="submit" className="btn-dashboard-primary">
                                    {editingTip ? 'Update Advisory' : 'Add Tip'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleTipReset} 
                                    className="btn-dashboard-secondary"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="emergency-banner-static">
                        <div className="banner-context">
                            <div className="static-marker-sos" style={{ background: 'rgba(76, 175, 80, 0.08)' }}><div className="marker-inner" style={{ background: '#4caf50' }}></div></div>
                            <div><h2 className="title-static">Advisories Registry</h2><span className="subtitle-static">Maha Kumbh • Live Safety & Health Guidelines</span></div>
                        </div>
                        <div className="banner-metrics-static">
                            <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4caf50' }}>
                                <div className="m-vals"><span className="digit">{tips.length}</span><span className="lab">Active Tips</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="table-wrapper-premium">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Advisory Content</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tips.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ width: '200px' }}>
                                            <span className={`status-pill status-${t.category === 'HEALTH' ? 'completed' : 'accepted'}`}>
                                                {t.category === 'HEALTH' ? 'Health & Hygiene' : 'Safety Advisory'}
                                            </span>
                                        </td>
                                        <td className="font-semibold">{t.tipText}</td>
                                        <td style={{ width: '150px' }}>
                                            <div className="table-actions-modern">
                                                <button onClick={() => { 
                                                    setEditingTip(t); 
                                                    resetTip({ category: t.category, tipText: t.tipText, image: null }); 
                                                    setIsNewCategory(t.category !== 'HEALTH' && t.category !== 'SAFETY');
                                                    document.querySelector('.admin-content')?.scrollTo({top: 0, behavior: 'smooth'}); 
                                                }} className="btn-edit-modern">Edit</button>
                                                <button onClick={() => handleTipDelete(t.id)} className="btn-delete-modern">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default HospitalsPage;
