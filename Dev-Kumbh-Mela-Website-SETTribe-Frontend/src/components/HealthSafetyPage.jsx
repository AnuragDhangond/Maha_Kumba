import React, { useEffect, useState, useMemo } from 'react';
import { Plus, ChevronRight, Sparkles, Wind, User, Clock, Phone, Truck, ShieldCheck, Heart, Flower2, Zap, Radio, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { emergencyService } from '../api/services/emergencyService';
import { hospitalService } from '../api/services/hospitalService';
import { healthTipService } from '../api/services/healthTipService';
import { campService } from '../api/services/campService';
import { safetyResourceService } from '../api/services/safetyResourceService';
import '../styles/HealthSafetyPage.css';
import { useTranslation } from 'react-i18next';
import HeadingOrnament from './HeadingOrnament';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useWebSocket } from '../hooks/useWebSocket';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Import local images
import medicalClinicImg from '../assets/medical_center.png';
import healthTipsImg from '../assets/health_tips.png';
import safetyAdvisoryImg from '../assets/safety_advisories.png';

// Import local icons for map
import clinicIconPng from '../assets/icons/clinic.png';
import fireIconPng from '../assets/icons/fire control.png';
import melaControlIconPng from '../assets/icons/mela control.png';
import policeIconPng from '../assets/icons/police controlroom.png';
import healthCampIconPng from '../assets/icons/Free health camp.png';

import { helplineService } from '../api/services/helplineService';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ center, zoom, isMapMaximized }) => {
    const map = useMap();
    useEffect(() => {
        // Force Leaflet to recalculate container bounds on toggle
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);
        return () => clearTimeout(timer);
    }, [isMapMaximized, map]);
    return null;
};

// --- Map Helper Functions & Icons ---

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const createMarkerIcon = (iconUrl, size = 60) => L.divIcon({
    className: 'custom-map-marker',
    html: `
        <div style="
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
            background: white;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 20px rgba(0,0,0,0.12);
        ">
            <img src="${iconUrl}" style="
                width: 75%;
                height: 75%;
                object-fit: contain;
            " />
        </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
});

const HospitalIcon = (hospital, isNearest = false) => {
    const size = isNearest ? 75 : 60;
    const iconUrl = clinicIconPng;

    return L.divIcon({
        className: 'hospital-marker-wrapper',
        html: `
            <div style="
                position: relative;
                width: ${size}px;
                height: ${size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 4px 15px rgba(0,0,0,0.4));
                background: white;
                border-radius: 50%;
                border: ${isNearest ? '3px solid #2E7D32' : '2px solid white'};
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            ">
                ${isNearest ? `
                <div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: rgba(46, 125, 50, 0.3);
                    border-radius: 50%;
                    animation: markerPulse 2s infinite;
                    z-index: -1;
                "></div>
                ` : ''}
                <img src="${iconUrl}" style="
                    width: 75%;
                    height: 75%;
                    object-fit: contain;
                " />
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    });
};

const getEmergencyIcon = (type) => {
    const size = 60;
    switch (type) {
        case 'POLICE': return createMarkerIcon(policeIconPng, size);
        case 'FIRE': return createMarkerIcon(fireIconPng, size);
        case 'CONTROL': return createMarkerIcon(melaControlIconPng, size);
        default: return createMarkerIcon(clinicIconPng, size);
    }
};

const CampIcon = () => createMarkerIcon(healthCampIconPng, 60);

    // AmbulanceIcon removed

const createUserIcon = () => L.divIcon({
    className: 'user-location-marker',
    html: `
        <div class="user-marker-container" style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div class="user-marker-pulse" style="position: absolute; width: 32px; height: 32px; background: rgba(30, 136, 229, 0.4); border-radius: 50%; animation: userPulse 2s infinite;"></div>
            <div class="user-marker-dot" style="position: relative; width: 18px; height: 18px; background: #1e88e5; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 2;">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                 </svg>
            </div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// --- Map Components ---

const MapFilters = ({ activeFilters, toggleFilter, translations, className }) => {
    const t = translations;
    const filterOptions = [
        { id: 'hospitals', label: t('medical') || 'Medical', icon: <img src={clinicIconPng} className="map-filter-icon-img" alt="" />, color: '#2E7D32', textColor: 'white' },
        { id: 'camps', label: 'Medical Camps', icon: <img src={healthCampIconPng} className="map-filter-icon-img" alt="" />, color: '#00838F', textColor: 'white' },
        { id: 'police', label: 'Police Station', icon: <img src={policeIconPng} className="map-filter-icon-img" alt="" />, color: '#1A237E', textColor: 'white' },
        { id: 'fire', label: 'Fire Station', icon: <img src={fireIconPng} className="map-filter-icon-img" alt="" />, color: '#D84315', textColor: 'white' },
        { id: 'control', label: 'Mela Control', icon: <img src={melaControlIconPng} className="map-filter-icon-img" alt="" />, color: '#512DA8', textColor: 'white' }
    ];

    return (
        <div className={`map-filters-overlay ${className || ''}`}>
            <div className="map-filters-container">
                <div className="map-filters-title">MAP DIRECTORY</div>
                <div className="map-filters-list">
                    {filterOptions.map(option => {
                        const isActive = activeFilters[option.id];
                        return (
                        <div
                            key={option.id}
                            onClick={() => toggleFilter && toggleFilter(option.id)}
                            className={`map-filter-item ${isActive ? 'active' : ''}`}
                            style={{ 
                                background: isActive ? option.color : '#f5f5f5', 
                                color: isActive ? option.textColor : '#999', 
                                border: isActive ? (option.border || '1px solid ' + option.color) : '1px solid #ddd',
                                boxShadow: isActive && option.color === '#FFFFFF' ? '0 4px 12px rgba(0,0,0,0.05)' : isActive ? `0 4px 12px ${option.color}44` : 'none',
                                cursor: 'pointer',
                                opacity: isActive ? 1 : 0.6,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div className="map-filter-icon-wrap" style={{ filter: isActive ? 'none' : 'grayscale(100%)', transition: 'all 0.3s ease' }}>{option.icon}</div>
                            {option.label}
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );
};

// MapBoundsHandler removed to prevent auto-zooming issues


const UserLocationOverlay = ({ userLocation, setUserLocation, radius = 5000 }) => {
    const map = useMap();
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watcher = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                // Only update if location is within Nashik area to prevent map jumps to other cities
                if (latitude > 19.85 && latitude < 20.15 && longitude > 73.65 && longitude < 73.95) {
                    setUserLocation([latitude, longitude]);
                } else {
                    console.warn("User location ignored as it is outside Nashik area:", latitude, longitude);
                }
            },
            (err) => console.warn("Geolocation access denied or error:", err),
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, [setUserLocation]);

    if (!userLocation) return null;

    return (
        <>
            <Marker position={userLocation} icon={createUserIcon()} zIndexOffset={1000} />
            <Circle center={userLocation} radius={radius} pathOptions={{ color: '#1e88e5', fillColor: '#1e88e5', fillOpacity: 0.05, weight: 1, dashArray: '5, 10' }} />
        </>
    );
};

const HospitalMarkers = ({ hospitals, userLocation, activeSOS, translations }) => {
    const map = useMap();
    const t = translations;
    const [nearestId, setNearestId] = useState(null);

    const processedHospitals = useMemo(() => {
        if (!userLocation) return hospitals;
        const sorted = hospitals.map(h => ({
            ...h,
            distance: getDistance(userLocation[0], userLocation[1], h.latitude, h.longitude)
        })).sort((a, b) => a.distance - b.distance);
        return sorted;
    }, [hospitals, userLocation]);

    useEffect(() => {
        if (userLocation && processedHospitals.length > 0) {
            setNearestId(processedHospitals[0].id);
        } else {
            setNearestId(null);
        }
    }, [processedHospitals, userLocation]);

    // Removed auto-flyTo effect to prevent map from jumping automatically

    return (
        <MarkerClusterGroup>
            {processedHospitals.map(hospital => (
                <Marker 
                    key={hospital.id} 
                    position={[hospital.latitude, hospital.longitude]} 
                    icon={HospitalIcon(hospital, hospital.id === nearestId)} 
                    eventHandlers={{ 
                        click: () => map.flyTo([hospital.latitude, hospital.longitude], 16, { animate: true }),
                        mouseover: (e) => e.target.openPopup()
                    }}
                >
                    <Popup autoPan={false}>
                        <div style={{ padding: '12px', minWidth: '220px', fontFamily: 'var(--font-dashboard-body)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <img src={clinicIconPng} style={{ width: '28px', height: '28px' }} alt="Hospital" />
                                <h4 style={{ margin: 0, color: '#4a2a18', fontFamily: 'var(--font-dashboard-heading)', fontSize: '1rem', lineHeight: '1.2' }}>{hospital.name}</h4>
                            </div>
                            {hospital.id === nearestId && (
                                <div style={{ background: '#FFF3E0', color: '#E65100', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '8px', border: '1px solid #FFE0B2' }}>NEAREST MEDICAL AID</div>
                            )}
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#555', lineHeight: '1.4' }}><strong>Address:</strong> {hospital.address}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', background: '#f9f9f9', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>{t('beds') || 'Beds'}:</span><span style={{ fontWeight: '700', color: '#2e7d32' }}>{hospital.beds} available</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Distance:</span><span style={{ color: '#2E7D32', fontWeight: '800' }}>{hospital.distance ? hospital.distance.toFixed(2) : 'N/A'} km</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Status:</span><span style={{ fontWeight: '700', color: '#1976D2' }}>Active / Open</span></div>
                            </div>
                            <a href={`tel:${hospital.contact}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', background: '#2E7D32', color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.2)' }}>
                                <Phone size={16} /> CALL {hospital.contact}
                            </a>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MarkerClusterGroup>
    );
};

const CampMarkers = ({ dynamicCamps }) => {
    return (
        <>
            {dynamicCamps && dynamicCamps.map(camp => (
                <Marker 
                    key={camp.id} 
                    position={[camp.latitude, camp.longitude]} 
                    icon={CampIcon()}
                    eventHandlers={{ 
                        mouseover: (e) => e.target.openPopup()
                    }}
                >
                    <Popup autoPan={false}>
                        <div style={{ padding: '12px', minWidth: '220px', fontFamily: 'var(--font-dashboard-body)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <img src={healthCampIconPng} style={{ width: '28px', height: '28px' }} alt="Camp" />
                                <h4 style={{ margin: 0, color: '#006064', fontFamily: 'var(--font-dashboard-heading)', fontSize: '1rem', lineHeight: '1.2' }}>{camp.name}</h4>
                            </div>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#555', lineHeight: '1.4' }}>{camp.address || camp.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', background: '#E0F2F1', padding: '10px', borderRadius: '12px', border: '1px solid #B2DFDB' }}>
                                <div><strong style={{ color: '#00796B' }}>Status:</strong> {camp.status || 'Active'}</div>
                                <div style={{ color: '#2e7d32', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>● LIVE LOCATION</div>
                            </div>
                            {camp.contact && (
                                <a href={`tel:${camp.contact}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', background: '#00838F', color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800' }}>
                                    <Phone size={16} /> CONTACT {camp.contact}
                                </a>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

const EmergencyMarkers = ({ activeFilters, resources }) => {
    const filteredResources = resources.filter(res => {
        if (res.type === 'CONTROL_ROOM') return activeFilters.control;
        if (res.type === 'POLICE') return activeFilters.police;
        if (res.type === 'FIRE') return activeFilters.fire;
        return false;
    });

    return (
        <>
            {filteredResources.map(res => (
                <Marker 
                    key={res.id} 
                    position={[res.latitude, res.longitude]} 
                    icon={getEmergencyIcon(res.type === 'CONTROL_ROOM' ? 'CONTROL' : res.type)}
                    eventHandlers={{ 
                        mouseover: (e) => e.target.openPopup()
                    }}
                >
                    <Popup autoPan={false}>
                        <div style={{ padding: '12px', minWidth: '220px', fontFamily: 'var(--font-dashboard-body)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
                                <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: res.type === 'POLICE' ? '#E8EAF6' : res.type === 'FIRE' ? '#FBE9E7' : '#EDE7F6',
                                    color: res.type === 'POLICE' ? '#1A237E' : res.type === 'FIRE' ? '#E64A19' : '#512DA8'
                                }}>
                                    <Phone size={18} />
                                </div>
                                <h4 style={{ margin: 0, color: res.type === 'POLICE' ? '#1A237E' : res.type === 'FIRE' ? '#E64A19' : '#512DA8', fontFamily: 'var(--font-dashboard-heading)', fontSize: '1rem', lineHeight: '1.2' }}>{res.name}</h4>
                            </div>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#555', lineHeight: '1.4' }}><strong>Address:</strong> {res.address || 'Location on Map'}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', background: '#f9f9f9', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div><strong style={{ color: '#666' }}>Category:</strong> <span style={{ fontWeight: '600' }}>{res.type}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Status:</span><span style={{ fontWeight: '700', color: res.status === 'Active' ? '#2e7d32' : '#d32f2f' }}>{res.status || 'Active'} / 24x7 Support</span></div>
                            </div>
                            <a href={`tel:${res.contact}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', background: res.type === 'POLICE' ? '#1A237E' : res.type === 'FIRE' ? '#E64A19' : '#512DA8', color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                                <Phone size={16} /> CALL {res.contact}
                            </a>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

// AmbulanceMarkers removed

const HealthSafetyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
    const [activeSOS, setActiveSOS] = useState(null);
    const [dynamicHelplines, setDynamicHelplines] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [allTips, setAllTips] = useState([]);
    const [safetyResources, setSafetyResources] = useState([]);
    const [mapCenter, setMapCenter] = useState([20.0075, 73.7898]); // Ram Kund area
    const [mapZoom, setMapZoom] = useState(15);
    const nashikBounds = L.latLngBounds([19.92, 73.72], [20.08, 73.88]); // Tightened focus on Nashik city center

    // New Map State
    const [userLocation, setUserLocation] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        hospitals: true,
        camps: true,
        police: true,
        fire: true,
        control: true
    });

    const toggleFilter = (id) => {
        setActiveFilters(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        fetchHelplines();
        fetchHospitals();
        fetchTips();
        fetchSafetyResources();
        const interval = setInterval(() => {
            fetchHospitals();
            fetchTips();
            fetchSafetyResources();
        }, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchSafetyResources = async () => {
        try {
            const response = await safetyResourceService.getAllResources(0, 1000);
            const allResources = response.data.content || [];
            // Only show resources that are explicitly marked as Active with null check
            setSafetyResources(allResources.filter(r => r.status && r.status.toLowerCase() === 'active'));
        } catch (error) {
            console.error("Error fetching safety resources:", error);
            setSafetyResources([]);
        }
    };

    const fetchTips = async () => {
        try {
            const response = await healthTipService.getAllTips();
            setAllTips(response.data);
        } catch (error) {
            console.error("Error fetching tips:", error);
            setAllTips([]);
        }
    };

    const fetchHelplines = async () => {
        try {
            // Requesting large size to show all helplines without frontend pagination
            const response = await helplineService.getHelplines(0, 1000);
            const data = response.data;
            const content = data.content || (Array.isArray(data) ? data : []);
            if (content.length > 0) {
                setDynamicHelplines(content);
            }
        } catch (error) {
            console.error("Error fetching helplines:", error);
        }
    };

    const fetchHospitals = async () => {
        try {
            // Requesting large size to show all hospitals on the map
            const response = await hospitalService.getAllHospitals(0, 1000);
            const data = response.data;
            const content = data.content || (Array.isArray(data) ? data : []);
            setHospitals(content);
        } catch (error) {
            console.warn("Hospital Fetch Failed:", error);
            setHospitals([]);
        }
    };


    useEffect(() => {
        const checkInitialStatus = async () => {
            try {
                const response = await emergencyService.getMyEmergencyStatus();
                if (response.status === 200 && response.data) {
                    setActiveSOS(response.data);
                }
            } catch (error) {
                console.error("Initial status check failed", error);
            }
        };
        checkInitialStatus();
    }, []);

    useWebSocket('/topic/sos', (message) => {
        // If the incoming message relates to our active SOS, update it
        if (activeSOS && message.alertId === activeSOS.alertId) {
            setActiveSOS(message);

            if (message.status.toLowerCase() === 'resolved') {
                setTimeout(() => {
                    setActiveSOS(null);
                }, 8000);
            }
        }
    });

    useEffect(() => {
        const handleLangChange = () => {
            setLang(localStorage.getItem('preferredLang') || 'en');
        };
        window.addEventListener('langchange', handleLangChange);
        return () => window.removeEventListener('langchange', handleLangChange);
    }, []);

    const { t } = useTranslation();

    const getHelplineIcon = (name) => {
        return <Phone size={24} color="#ffffff" />;
    };

    // Replace SOS Logic with a more professional SweetAlert2
    const handleSOS = () => {
        // Step 1: Confirmation
        Swal.fire({
            title: `<span style="color: #D32F2F; font-weight: 800; font-family: Cinzel, serif;">${t('emergencySosTitle')}</span>`,
            html: `
                <div style="padding: 10px; font-family: Inter, sans-serif;">
                    <p style="font-size: 1.1rem; color: #4a2a18; margin-bottom: 20px;">
                        ${t('sosConfirmation')}
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            cancelButtonColor: '#795d4d',
            confirmButtonText: t('broadcastAlert'),
            cancelButtonText: t('ignore'),
            reverseButtons: true,
            background: '#ffffff',
            backdrop: `rgba(46, 26, 14, 0.8)`
        }).then((result) => {
            if (result.isConfirmed) {
                // Step 2: Get Geolocation
                if (!navigator.geolocation) {
                    Swal.fire('Error', 'Geolocation is not supported by your browser.', 'error');
                    return;
                }

                Swal.fire({
                    title: t('connectingToGps'),
                    text: 'Please allow location access if prompted.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const { latitude, longitude } = position.coords;
                                // Step 3: Select Emergency Type (Redesigned for Premium UI)
                                Swal.fire({
                                    title: `<span style="font-family: Cinzel, serif; font-weight: 800; color: #4a2a18;">${t('selectCategory')}</span>`,
                                    html: `
                                        <div class="sos-type-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px 10px; font-family: Inter, sans-serif;">
                                            <button class="sos-type-btn" data-type="Medical" style="background: #f0fdf4; border: 2px solid #dcfce7; padding: 20px; border-radius: 18px; cursor: pointer; transition: all 0.2s;">
                                                
                                                <div style="font-weight: 700; color: #166534;">${t('medical')}</div>
                                            </button>
                                            <button class="sos-type-btn" data-type="Fire" style="background: #fff7ed; border: 2px solid #ffedd5; padding: 20px; border-radius: 18px; cursor: pointer; transition: all 0.2s;">
                                                
                                                <div style="font-weight: 700; color: #9a3412;">${t('fire')}</div>
                                            </button>
                                            <button class="sos-type-btn" data-type="Lost Person" style="background: #f0f9ff; border: 2px solid #e0f2fe; padding: 20px; border-radius: 18px; cursor: pointer; transition: all 0.2s;">
                                                
                                                <div style="font-weight: 700; color: #075985;">${t('lostPerson')}</div>
                                            </button>
                                            <button class="sos-type-btn" data-type="Crowd Issue" style="background: #f5f3ff; border: 2px solid #ede9fe; padding: 20px; border-radius: 18px; cursor: pointer; transition: all 0.2s;">
                                                
                                                <div style="font-weight: 700; color: #5b21b6;">${t('crowdIssue')}</div>
                                            </button>
                                            <button class="sos-type-btn" data-type="Other" style="background: #f9fafb; border: 2px solid #f3f4f6; grid-column: span 2; padding: 15px; border-radius: 18px; cursor: pointer; transition: all 0.2s;">
                                                <div style="font-weight: 700; color: #374151;">${t('otherSecurity')}</div>
                                            </button>
                                        </div>
                                    `,
                                    showConfirmButton: false,
                                    showCancelButton: true,
                                    cancelButtonText: t('back'),
                                    cancelButtonColor: '#795d4d',
                                    background: '#ffffff',
                                    didOpen: () => {
                                        const buttons = document.querySelectorAll('.sos-type-btn');
                                        buttons.forEach(btn => {
                                            btn.addEventListener('click', () => {
                                                const type = btn.getAttribute('data-type');
                                                Swal.clickConfirm();
                                                setTimeout(() => sendSOSToBackend(latitude, longitude, type), 100);
                                            });
                                            // Add hover effects via JS since it's an inline string
                                            btn.onmouseover = () => { btn.style.transform = 'translateY(-3px)'; btn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)'; };
                                            btn.onmouseout = () => { btn.style.transform = 'translateY(0)'; btn.style.boxShadow = 'none'; };
                                        });
                                    }
                                });
                            },
                            (error) => {
                                Swal.fire(t('locationError'), t('failedToGetCoordinates'), 'error');
                            }
                        );
                    }
                });
            }
        });
    };

    const sendSOSToBackend = (latitude, longitude, emergencyType) => {
        Swal.fire({
            title: 'Broadcasting Signal...',
            text: 'Sending coordinates to Mela Control Room',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
                emergencyService.createEmergency({ latitude, longitude, emergencyType })
                    .then(response => {
                        const data = response.data;
                        setActiveSOS(data);

                        Swal.fire({
                            title: `<span style="font-family: Cinzel, serif; font-weight: 800;">${t('emergencySignalReceived')}</span>`,
                            html: `
                            <div style="text-align: center; font-family: Inter, sans-serif; padding: 10px;">
                                <p style="font-size: 1.1rem; color: #4a2a18;">${t('emergencyUrgentStatus')}</p>
                                <div style="margin-top: 20px; padding: 15px; background: #f1f8e9; border-radius: 12px; color: #2e7d32; font-weight: 800;">
                                    ${t('trackingId')}: ${data.alertId} <br/> ${t('stayAtLocation')}
                                </div>
                            </div>
                        `,
                            icon: 'success',
                            confirmButtonColor: '#2E7D32',
                            confirmButtonText: t('trackStatus'),
                            background: '#ffffff'
                        });
                    }).catch(() => {
                        Swal.fire(t('offlineAlert'), t('serverConnectionFailed'), 'error');
                    });
            }
        });
    };

    const getCategoryImage = (category) => {
        const baseURL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`).replace(/\/$/, '');
        // Find if there's a custom path for this category in the tips list
        const tipWithPath = allTips.find(t => t.category === category && t.imagePath);
        if (tipWithPath && tipWithPath.imagePath) {
            return tipWithPath.imagePath.startsWith('http')
                ? tipWithPath.imagePath
                : `${baseURL}${tipWithPath.imagePath.startsWith('/') ? '' : '/'}${tipWithPath.imagePath}`;
        }

        switch (category) {
            case 'HEALTH': return healthTipsImg;
            case 'SAFETY': return safetyAdvisoryImg;
            default: return medicalClinicImg;
        }
    };

    const formatCategoryTitle = (category) => {
        if (category === 'HEALTH') return t('healthHygieneTips') || "Health & Hygiene Tips";
        if (category === 'SAFETY') return t('safetyAdvisories') || "Safety Advisories";
        return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() + " Guidelines";
    };

    const dynamicFeatures = [
        {
            id: 'hospitals',
            image: medicalClinicImg,
            title: t('healthClinics') || "Medical Centers & Clinics",
            items: hospitals.slice(0, 4).map(h => `${h.name} (${h.address})`)
        },
        ...Array.from(new Set(allTips.map(t => t.category))).map(cat => ({
            id: cat,
            image: getCategoryImage(cat),
            title: formatCategoryTitle(cat),
            items: allTips
                .filter(t => t.category === cat)
                .map(t => t.tipText)
        }))
    ];

    const [isMapMaximized, setIsMapMaximized] = useState(false);

    const toggleMapSize = () => {
        setIsMapMaximized(!isMapMaximized);
    };

    const filteredCamps = useMemo(() => 
        safetyResources.filter(r => r.type === 'CAMP'), 
    [safetyResources]);

    const filteredEmergencyResources = useMemo(() => 
        safetyResources.filter(r => r.type !== 'CAMP'), 
    [safetyResources]);

    const formatTime = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isRecentlyUpdated = (updatedAt) => {
        if (!updatedAt) return false;
        const lastUpdate = new Date(updatedAt).getTime();
        const now = new Date().getTime();
        return (now - lastUpdate) < 3600000; // Less than 1 hour
    };

    useEffect(() => {
        if (location.state?.triggerSOS) {
            // Small delay to ensure component is fully ready
            setTimeout(() => {
                handleSOS();
                // Clear state so it doesn't re-trigger on refresh
                navigate(location.pathname, { replace: true, state: {} });
            }, 500);
        }
    }, [location.state]);

    return (
        <div className="health-page">
            <section className="health-hero">
                <div className="health-hero-overlay"></div>
                <div className="health-hero-content fade-in-up">
                    <div className="hero-branding">
                        <span className="hero-badge">{t('safetyFirstBadge')}</span>
                    </div>
                    <h1 className="hero-title">{t('healthSafety')}</h1>
                    <HeadingOrnament variant="leaf" />
                    <div className="hero-divider"></div>
                    <p className="hero-subtitle">
                        {t('healthHeroSubtitle')}
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary-health" onClick={() => document.getElementById('hospital-map').scrollIntoView({ behavior: 'smooth' })}>
                            {t('findNearbyAid')}
                        </button>
                    </div>
                </div>
            </section>

            <section className="sos-premium-container fade-in-up">
                <div className="sos-bg-glow"></div>
                <div className="sos-mandala-bg"></div>

                <div className="sos-unified-flex-hub">
                    {/* Floating Glassmorphism SOS Card */}
                    <div className="sos-hero-card-premium">
                        <div className="sos-emblem-wrapper">
                            <div className="sos-emblem-btn">
                                <Flower2 size={55} color="#4a2a18" className="lotus-glyph" />
                            </div>
                        </div>

                        <h2 className="sos-premium-heading">Emergency SOS</h2>
                        <p className="sos-premium-subtext">
                            Tap the button below if you need <span>immediate support.</span> Our team is ready to help you in this moment.
                        </p>

                        <button className="btn-sos-trigger-premium" onClick={handleSOS}>
                            <Radio size={30} className="sos-icon-spin" />
                            SOS
                        </button>

                        <div className="sos-security-footer" style={{ marginTop: '25px' }}>
                            <AlertTriangle size={22} color="#FF3131" className="warning-icon-pulse" />
                            <span className="warning-text-highlight"> Use SOS only for real emergencies. Misuse may lead to strict action.</span>
                        </div>
                    </div>

                    {/* Premium Helpline Grid - Now Beside/Inside the Hub */}
                    <div className="helpline-column-wrapper">
                        <h3 className="helpline-hub-title">Emergency Helplines</h3>
                        <div className="helpline-premium-grid">
                            {dynamicHelplines.length > 0 ? (
                                dynamicHelplines.map(hl => (
                                    <div className="helpline-card-premium" key={hl.id} onClick={() => window.location.href = `tel:${hl.number}`}>
                                        <div className="icon-container">
                                            {getHelplineIcon(hl.name)}
                                        </div>
                                        <div className="info">
                                            <span className="title">{hl.name}</span>
                                            <span className="number">{hl.number}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="helpline-card-premium" onClick={() => window.location.href = "tel:108"}>
                                        <div className="icon-container">
                                            <Phone size={24} color="#ffffff" />
                                        </div>
                                        <div className="info">
                                            <span className="title">{t('medicalAssistance')}</span>
                                            <span className="number">108</span>
                                        </div>
                                    </div>
                                    <div className="helpline-card-premium" onClick={() => window.location.href = "tel:100"}>
                                        <div className="icon-container">
                                            <Phone size={24} color="#ffffff" />
                                        </div>
                                        <div className="info">
                                            <span className="title">{t('localPolice')}</span>
                                            <span className="number">100</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className={`map-container ${isMapMaximized ? 'maximized' : ''}`} id="hospital-map">
                {!isMapMaximized && (
                    <div className="section-head">
                        <h2 className="health-section-title"><span></span> {t('liveHospitalLocator')}</h2>
                        <div className="map-legend" style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
                            {t('updateFrequencyNote')}
                        </div>
                        <button className="map-toggle-btn" onClick={toggleMapSize}>
                            {t('maximizeMap')}
                        </button>
                    </div>
                )}
                <div 
                    className="live-map-wrapper" 
                    style={isMapMaximized ? { position: 'relative', overflow: 'hidden' } : { height: '650px', borderRadius: '16px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative' }}
                >
                    {/* 1. Desktop Filters Component (Legend) */}
                    <MapFilters
                        activeFilters={activeFilters}
                        toggleFilter={toggleFilter}
                        translations={t}
                        className="desktop-filters"
                    />

                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                        maxBounds={nashikBounds}
                        maxBoundsViscosity={1.0}
                        minZoom={12}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <MapController center={mapCenter} zoom={mapZoom} isMapMaximized={isMapMaximized} />

                        {/* 2. User Location Overlay */}
                        <UserLocationOverlay
                            userLocation={userLocation}
                            setUserLocation={setUserLocation}
                            radius={5000}
                        />

                        {/* 3. Hospital Markers (with Clustering & SOS logic) */}
                        {activeFilters.hospitals && (
                            <HospitalMarkers
                                hospitals={hospitals}
                                userLocation={userLocation}
                                activeSOS={activeSOS}
                                translations={t}
                            />
                        )}

                        {/* 4. Medical Camps Markers */}
                        {activeFilters.camps && (
                            <CampMarkers
                                dynamicCamps={filteredCamps}
                            />
                        )}

                        {/* 5. Emergency Centers Markers */}
                        <EmergencyMarkers 
                            activeFilters={activeFilters} 
                            resources={filteredEmergencyResources}
                        />

                        {/* 6. Live Ambulance Markers Removed */}

                        {/* 7. Removed BoundsHandler to prevent auto-zooming issues */}
                    </MapContainer>
                </div>
                
                {/* 8. Mobile Filters Component (Rendered after/below the map) */}
                <MapFilters
                    activeFilters={activeFilters}
                    toggleFilter={toggleFilter}
                    translations={t}
                    className="mobile-filters"
                />
                {isMapMaximized && (
                    <button className="map-close-btn" onClick={toggleMapSize}>×</button>
                )}
            </section>

            {/* <section className="health-grid">
                {dynamicFeatures.map(feature => (
                    <div className="health-card" key={feature.id}>
                        <div className="card-image-wrapper">
                            <img src={feature.image} alt={feature.title} className="card-real-image" />
                        </div>
                        <h3>{feature.title}</h3>
                        <div className="health-card-scroll-area">
                            <ul>
                                {feature.items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </section> */}

            <section className="crowd-advisory-section">
                <div className="advisory-container">
                    <div className="section-head-centered">
                        <h2 className="health-section-title">{t('liveCrowdAdvisory')}</h2>
                        <div className="heading-ornament-mini"></div>
                        <p className="advisory-subtitle">{t('realTimeAdvisorySub')}</p>
                    </div>

                    <div className="alert-box-premium">
                        <div className="alert-content">
                            <h3 className="alert-title">
                                <span className="alert-icon"></span>
                                {t('overcrowdedZonesAlert')}
                            </h3>
                            <p className="alert-text">
                                {t('ramkundPanchvatiAlert')}
                            </p>
                            <div className="alert-actions">
                                <button
                                    className="btn-primary-health"
                                    onClick={() => { navigate('/crowd-status'); }}
                                >
                                    {t('viewLiveDensityMap')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Floating SOS Tracking Panel */}
            {activeSOS && (
                <div className={`sos-status-panel fade-in-up status-${activeSOS.status.toLowerCase()}`}>
                    <div className="status-indicator-dot"></div>
                    <div className="status-header-track">
                        <span className="tracking-badge">{activeSOS.alertId}</span>
                        <h3>
                            {activeSOS.status.toLowerCase() === 'pending' ? t('assigningHelp') :
                                activeSOS.status.toLowerCase() === 'accepted' ? t('helpOnWay') :
                                    t('solvedSuccessfully')}
                        </h3>
                    </div>
                    <div className="status-body-track">
                        <p>
                            {activeSOS.status.toLowerCase() === 'pending' ? (t('pendingStatusText') || 'Searching for nearest medical/security team...') :
                                activeSOS.status.toLowerCase() === 'accepted' ? (t('acceptedStatusText') || `Great News! Control Room (Officer ${activeSOS.acceptedBy || 'Shri. Mahant'}) is responding.`) :
                                    (t('resolvedStatusText') || 'Your request has been successfully solved by the Control Room. Stay safe!')}
                        </p>
                    </div>
                    {activeSOS.status === 'Resolved' && (
                        <button className="status-close-btn" onClick={() => {
                            setActiveSOS(null);
                        }}>{t('dismiss')}</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default HealthSafetyPage;
