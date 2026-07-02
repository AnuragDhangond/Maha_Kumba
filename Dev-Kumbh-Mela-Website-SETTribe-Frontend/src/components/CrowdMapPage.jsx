import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import '../styles/CrowdMap.css';
import { translations } from '../utils/translations';
import HeadingOrnament from './HeadingOrnament';
import { Activity, RefreshCw, AlertCircle, ShieldCheck, MapPin, Search } from 'lucide-react';
import { crowdService } from '../api/services/crowdService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Swal from 'sweetalert2';

// Component to handle map view reset or flying to location
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { animate: true, duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
};


// Heatmap Layer Component
const HeatmapLayer = ({ locations, livePings }) => {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        // Prepare heatmap data: [lat, lng, intensity]
        const locationHeat = locations.map(loc => {
            let intensity = 0.3;
            if (loc.crowdLevel === 'RED') intensity = 1.0;
            else if (loc.crowdLevel === 'YELLOW') intensity = 0.6;
            return [loc.latitude, loc.longitude, intensity];
        });

        // Add live traffic pings to the heatmap for a more "real-time traffic" feel
        const pingHeat = Object.values(livePings || {}).map(ping => [ping.latitude, ping.longitude, 0.8]);
        
        const heatData = [...locationHeat, ...pingHeat];

        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        heatLayerRef.current = L.heatLayer(heatData, {
            radius: 35,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.1: 'blue',
                0.2: 'lime',
                0.5: 'yellow',
                0.7: 'orange',
                1.0: 'red'
            }
        }).addTo(map);

        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [locations, livePings, map]);

    return null;
};


// Routing Machine Component
const RoutingMachine = ({ userLocation, destination }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !userLocation || !destination) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
            waypoints: [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination[0], destination[1])
            ],
            lineOptions: {
                styles: [{ color: '#1e3a8a', weight: 6, opacity: 0.8 }]
            },
            show: false, // Don't show the text directions by default
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null // Don't create new markers, we already have them
        }).addTo(map);

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, userLocation, destination]);

    return null;
};

const createPulsingIcon = (level) => {
    return L.divIcon({
        className: 'pulsing-marker',
        html: `
            <div class="marker-core core-${level.toLowerCase()}">
                <div class="marker-pulse pulse-${level.toLowerCase()}"></div>
            </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const createUserLocationIcon = () => {
    return L.divIcon({
        className: 'user-location-marker',
        html: `
            <div class="user-marker-core">
                <div class="user-marker-pulse"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const CrowdMapPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
    const [locations, setLocations] = useState([]);
    const [livePings, setLivePings] = useState({}); // deviceId -> ping
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([20.0051, 73.7896]);
    const [mapZoom, setMapZoom] = useState(14);
    const [selectedId, setSelectedId] = useState(null);
    const [viewMode, setViewMode] = useState('kumbh'); // 'kumbh' or 'nashik'
    const [userLocation, setUserLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [alertedZones, setAlertedZones] = useState(new Set());

    // Haversine formula to calculate distance between two points in km
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    // Geo-fencing check
    useEffect(() => {
        if (!userLocation || locations.length === 0) return;

        const redZones = locations.filter(loc => loc.crowdLevel === 'RED');
        redZones.forEach(zone => {
            const dist = getDistance(userLocation[0], userLocation[1], zone.latitude, zone.longitude);
            if (dist < 0.5) { // 500 meters
                if (!alertedZones.has(zone.id)) {
                    Swal.fire({
                        title: 'Crowd Warning!',
                        text: `You are approaching ${zone.locationName} which is currently overcrowded. Consider taking an alternative route.`,
                        icon: 'warning',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 5000,
                        timerProgressBar: true
                    });
                    setAlertedZones(prev => new Set(prev).add(zone.id));
                }
            }
        });
    }, [userLocation, locations, alertedZones]);

    // Query state is now managed by React Router
    const query = location.search;

    useEffect(() => {
        // Generate or get persistent device ID
        let deviceId = localStorage.getItem('kumbh_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('kumbh_device_id', deviceId);
        }

        const reportGPS = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setUserLocation([latitude, longitude]);
                        // Report to backend for live density calculation
                        crowdService.pingLocation({ deviceId, latitude, longitude });
                    },
                    (err) => console.log("User location denied or unavailable.")
                );
            }
        };

        // Initial ping
        reportGPS();

        // Notify backend when user leaves the page
        const handleBeforeUnload = () => {
            crowdService.disconnectUser(deviceId);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Ping every 60 seconds (simulating Google Maps background traffic reporting)
        const pingInterval = setInterval(reportGPS, 60000);
        
        return () => {
            clearInterval(pingInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            crowdService.disconnectUser(deviceId); // Also disconnect on component unmount
        };
    }, []);

    const queryParams = new URLSearchParams(query);
    const typeFilter = queryParams.get('type');

    const t = translations[lang] || translations['en'];

    const fetchCrowdStatus = async () => {
        try {
            const response = await crowdService.getCrowdStatus();
            let data = response.data;
            
            // Also fetch initial pings for the heatmap
            const pingResponse = await crowdService.getLivePings();
            const pingsObj = {};
            pingResponse.data.forEach(p => pingsObj[p.deviceId] = p);
            setLivePings(pingsObj);

            // Apply dual filtering
            if (viewMode === 'kumbh') {
                // Focus only on religious core areas
                data = data.filter(loc => ['ghat', 'temple', 'park'].includes(loc.locationType?.toLowerCase()));
            }

            if (typeFilter) {
                data = data.filter(loc => loc.locationType?.toLowerCase() === typeFilter.toLowerCase());
            }

            setLocations(data);
            setLastUpdated(new Date().toLocaleTimeString());
            setLoading(false);
        } catch (error) {
            console.error("Error fetching crowd status:", error);
            // Fallback for demo
            let demoData = [
                { id: 1, locationName: "Ramkund Ghat", latitude: 20.0051, longitude: 73.7896, crowdLevel: "RED", lastUpdated: new Date(), locationType: 'Ghat' },
                { id: 2, locationName: "Kalaram Temple", latitude: 20.0069, longitude: 73.7915, crowdLevel: "YELLOW", lastUpdated: new Date(), locationType: 'Temple' },
                { id: 3, locationName: "Tapovan Area", latitude: 20.0069, longitude: 73.8166, crowdLevel: "GREEN", lastUpdated: new Date(), locationType: 'Park' },
                { id: 4, locationName: "Trimbakeshwar Temple", latitude: 19.9324, longitude: 73.5308, crowdLevel: "YELLOW", lastUpdated: new Date(), locationType: 'Temple' },
                { id: 5, locationName: "Panchvati Banks", latitude: 20.0080, longitude: 73.7900, crowdLevel: "RED", lastUpdated: new Date(), locationType: 'Ghat' },
                { id: 6, locationName: "Someshwar Waterfall", latitude: 19.9922, longitude: 73.7380, crowdLevel: "GREEN", lastUpdated: new Date(), locationType: 'Nature' }
            ];

            if (viewMode === 'kumbh') {
                demoData = demoData.filter(loc => ['ghat', 'temple', 'park', 'cultural'].includes(loc.locationType?.toLowerCase()));
            }

            if (typeFilter) {
                demoData = demoData.filter(loc => loc.locationType?.toLowerCase() === typeFilter.toLowerCase());
            }

            setLocations(demoData);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrowdStatus();
        
        // Auto-center map based on view mode
        if (viewMode === 'kumbh') {
            setMapCenter([20.0051, 73.7896]); // Ramkund area
            setMapZoom(15);
        } else {
            setMapCenter([19.9975, 73.7898]); // Wider Nashik view
            setMapZoom(13);
        }

        // Setup WebSocket Client
        const client = new Client({
            webSocketFactory: () => new SockJS(`http://${window.location.hostname}:8080/ws-crowd`),
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe('/topic/crowd-updates', (message) => {
                    const updatedLocation = JSON.parse(message.body);
                    setLocations(prevLocations => {
                        const exists = prevLocations.find(loc => loc.id === updatedLocation.id);
                        if (exists) {
                            return prevLocations.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc);
                        } else {
                            return [...prevLocations, updatedLocation];
                        }
                    });
                    setLastUpdated(new Date().toLocaleTimeString());
                });

                client.subscribe('/topic/live-traffic', (message) => {
                    const ping = JSON.parse(message.body);
                    setLivePings(prev => ({
                        ...prev,
                        [ping.deviceId]: ping
                    }));
                });

                client.subscribe('/topic/live-traffic-remove', (message) => {
                    const deviceIdToRemove = message.body;
                    setLivePings(prev => {
                        const newState = { ...prev };
                        delete newState[deviceIdToRemove];
                        return newState;
                    });
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [query, viewMode]);

    const focusLocation = (loc) => {
        setMapCenter([loc.latitude, loc.longitude]);
        setMapZoom(16);
        setSelectedId(loc.id);
        // We don't automatically set destination here to avoid cluttering the map with routes immediately
    };

    const startNavigation = (loc) => {
        setDestination([loc.latitude, loc.longitude]);
        setMapCenter([loc.latitude, loc.longitude]);
        setMapZoom(16);
    };

    // Geo-fencing Coordinates
    const kumbhCoreCoords = [
        [20.0180, 73.7750], [20.0180, 73.8150], [19.9980, 73.8150], [19.9980, 73.7750]
    ];

    const nashikCityCoords = [
        [20.0500, 73.7400], [20.0500, 73.8500], [19.9500, 73.8500], [19.9500, 73.7400]
    ];

    const redZones = locations.filter(l => l.crowdLevel === 'RED');

    return (
        <div className="crowd-map-page">
            <header className="crowd-hero">
                <div className="live-status-badge">
                    <Activity size={16} /> {t.liveNow || "LIVE MONITORING"}
                </div>
                <h1>LIVE CROWD STATUS MAP</h1>
                <HeadingOrnament variant="diamond" />
                <p style={{ maxWidth: '600px', margin: '15px auto', fontSize: '1.1rem', opacity: 0.9 }}>
                    Real-time density analytics for Nashik's holy ghats and temples to ensure a safe and spiritual experience.
                </p>
            </header>

            <div className="map-main-layout">
                <div className="map-container-main">
                    <div className="last-updated-pill">
                        <RefreshCw size={14} /> {t.lastUpdated || "Sync"}: {lastUpdated}
                    </div>

                    <div className="map-wrapper">
                        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} attributionControl={false}>
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapController center={mapCenter} zoom={mapZoom} />
                            <HeatmapLayer locations={locations} livePings={livePings} />
                            <RoutingMachine userLocation={userLocation} destination={destination} />
                            
                            {/* Geo-fenced Area Borders (Glowing & User-Friendly) */}
                            {viewMode === 'kumbh' ? (
                                <Polygon 
                                    positions={kumbhCoreCoords}
                                    pathOptions={{ 
                                        color: '#e65c00', 
                                        fillColor: '#ff7e36', 
                                        fillOpacity: 0.08, 
                                        dashArray: '10, 10', 
                                        weight: 4,
                                        lineCap: 'round',
                                        lineJoin: 'round'
                                    }}
                                >
                                    <Tooltip sticky>
                                        <div style={{ padding: '2px 8px', fontWeight: 800, color: '#e65c00' }}>
                                            🕉️ SACRED KUMBH PERIMETER
                                        </div>
                                    </Tooltip>
                                </Polygon>
                            ) : (
                                <Polygon 
                                    positions={nashikCityCoords}
                                    pathOptions={{ 
                                        color: '#1e3a8a', 
                                        fillColor: '#1e3a8a', 
                                        fillOpacity: 0.05, 
                                        dashArray: '15, 20', 
                                        weight: 3,
                                        lineCap: 'round',
                                        lineJoin: 'round'
                                    }}
                                >
                                    <Tooltip sticky>
                                        <div style={{ padding: '2px 8px', fontWeight: 800, color: '#1e3a8a' }}>
                                            🏙️ NASHIK CITY MONITORING ZONE
                                        </div>
                                    </Tooltip>
                                </Polygon>
                            )}

                            {/* USER CURRENT LOCATION MARKER */}
                            {userLocation && (
                                <Marker position={userLocation} icon={createUserLocationIcon()} zIndexOffset={1000}>
                                    <Popup>
                                        <div style={{ textAlign: 'center', padding: '5px' }}>
                                            <strong style={{ color: '#1e3a8a' }}>📍 YOU ARE HERE</strong>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.8rem' }}>Relative to Kumbh sites</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {locations.map((loc) => (
                                <Marker 
                                    key={loc.id}
                                    position={[loc.latitude, loc.longitude]} 
                                    icon={createPulsingIcon(loc.crowdLevel)}
                                    eventHandlers={{ click: () => focusLocation(loc) }}
                                >
                                    <Popup>
                                        <div style={{ padding: '5px', textAlign: 'center' }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontFamily: 'Cinzel' }}>{loc.locationName}</h4>
                                            <div style={{ color: loc.crowdLevel === 'RED' ? '#d32f2f' : loc.crowdLevel === 'YELLOW' ? '#f59e0b' : '#10b981', fontWeight: 800, marginBottom: '10px' }}>
                                                {loc.crowdLevel} DENSITY
                                            </div>
                                            <button 
                                                onClick={() => startNavigation(loc)}
                                                style={{ 
                                                    background: '#1e3a8a', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '8px 12px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    margin: '0 auto'
                                                }}
                                            >
                                                <MapPin size={14} /> GET DIRECTIONS
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>

                    <div className="map-legend-overlay">
                        <div className="legend-row"><span className="status-dot" style={{background: '#22c55e'}}></span> Low (Safe)</div>
                        <div className="legend-row"><span className="status-dot" style={{background: '#eab308'}}></span> Moderate</div>
                        <div className="legend-row legend-rowLast"><span className="status-dot" style={{background: '#ef4444'}}></span> High (Avoid)</div>
                    </div>
                </div>

                <aside className="map-sidebar-alerts">
                    <div className="sidebar-title">
                        <AlertCircle size={24} color="#d32f2f" />
                        <span>Density Feed</span>
                    </div>
                    
                    <div className="alert-feed">
                        {redZones.length > 0 && (
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.8rem', fontWeight: 700 }}>⚠️ HIGH ALERT AREAS</p>
                                <p style={{ margin: '5px 0 0', fontSize: '0.85rem' }}>{redZones.map(z => z.locationName).join(', ')} currently overcrowded.</p>
                            </div>
                        )}

                        {locations.sort((a, b) => (a.crowdLevel === 'RED' ? -1 : 1)).map(loc => (
                            <div 
                                key={loc.id} 
                                className={`alert-item ${loc.crowdLevel.toLowerCase()} ${selectedId === loc.id ? 'active' : ''}`}
                                onClick={() => focusLocation(loc)}
                            >
                                <div className="alert-header">
                                    <span className="alert-loc">{loc.locationName}</span>
                                    <span className="alert-level">{loc.crowdLevel}</span>
                                </div>
                                <div className="alert-desc">
                                    {loc.crowdLevel === 'RED' ? 'Extreme crowd. Temporary entry restrictions may apply.' : 
                                     loc.crowdLevel === 'YELLOW' ? 'Moderate movement. Recommended to visit with care.' : 
                                     'Smooth movement. Ideal time for sacred visits and prayers.'}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            <div className="view-mode-selector">
                <button 
                    className={`view-toggle-btn ${viewMode === 'kumbh' ? 'active' : ''}`}
                    onClick={() => setViewMode('kumbh')}
                >
                    <div className="toggle-icon">🔱</div>
                    <div className="toggle-info">
                        <h4>Mela Corridors</h4>
                        <p>Core Kumbh Mela sites, Ghats & Temples</p>
                    </div>
                </button>

                <button 
                    className={`view-toggle-btn ${viewMode === 'nashik' ? 'active' : ''}`}
                    onClick={() => setViewMode('nashik')}
                >
                    <div className="toggle-icon">🏙️</div>
                    <div className="toggle-info">
                        <h4>Nashik Wide</h4>
                        <p>Complete city coverage & transit hubs</p>
                    </div>
                </button>
            </div>

            <div className="info-cards">
                <div className="premium-card">
                    <div className="card-icon-box"><ShieldCheck size={32} /></div>
                    <div className="card-text">
                        <h4>Safe Passage Protocol</h4>
                        <p>Our AI-enhanced monitoring system updates every 5 minutes to ensure you always have the latest safety data.</p>
                    </div>
                </div>
                <div className="premium-card">
                    <div className="card-icon-box"><MapPin size={32} /></div>
                    <div className="card-text">
                        <h4>Optimal Route Planning</h4>
                        <p>When a ghat is marked <b>Red</b>, please check the sidebar for suggested green-zone alternatives nearby.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrowdMapPage;
