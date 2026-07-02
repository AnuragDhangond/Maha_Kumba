import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { Navigation, ShieldCheck, AlertTriangle, Loader2, Locate } from 'lucide-react';
import { crowdService } from '../api/services/crowdService';
import useLocationSharing from '../hooks/useLocationSharing';
import { useWebSocket } from '../hooks/useWebSocket';

// Custom pulsing icons
const createPulsingIcon = (level) => L.divIcon({
    className: 'pulsing-marker',
    html: `<div class="marker-core core-${level.toLowerCase()}"><div class="marker-pulse pulse-${level.toLowerCase()}"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const createUserIcon = () => L.divIcon({
    className: 'user-location-marker',
    html: `<div class="user-gps-dot"><div class="user-gps-pulse"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Helper component to handle routing logic with useMap hook
const RouteLayer = ({ userLocation, destination, onRouteUpdate, setLoading }) => {
    const map = useMap();
    const routingControlRef = useRef(null);
    const lastDestRef = useRef(null);

    useEffect(() => {
        if (!userLocation || !destination || !map) return;
        
        // Only fetch if destination changed OR if we didn't have a location before
        const isSameDest = lastDestRef.current === destination.name;
        if (isSameDest && routingControlRef.current) return;
        
        lastDestRef.current = destination.name;

        const fetchRoute = async () => {
            try {
                if (setLoading) setLoading(true);
                
                // Clear existing route
                if (routingControlRef.current) {
                    map.removeControl(routingControlRef.current);
                }

                const res = await crowdService.getSmartRoute({
                    startLat: userLocation[0], startLng: userLocation[1],
                    endLat: destination.lat, endLng: destination.lng
                });
                
                const data = res.data;
                if (onRouteUpdate) onRouteUpdate(data);

                if (data && data.path && data.path.length > 0) {
                    const waypoints = data.path.map(p => L.latLng(p.lat, p.lng));
                    
                    routingControlRef.current = L.Routing.control({
                        waypoints: waypoints,
                        lineOptions: {
                            styles: [
                                { color: '#000', weight: 8, opacity: 0.4 }, // Shadow
                                { color: data.safetyStatus === 'RED' ? '#ef4444' : '#10b981', weight: 6, opacity: 0.9 }
                            ]
                        },
                        addWaypoints: false,
                        draggableWaypoints: false,
                        show: false,
                        createMarker: () => null
                    }).addTo(map);

                    // Fit map to show the whole route
                    const bounds = L.latLngBounds(waypoints);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
                if (setLoading) setLoading(false);
            } catch (error) {
                console.error("Routing error:", error);
                // Simple direct route fallback if backend fails
                const directWaypoints = [
                    L.latLng(userLocation[0], userLocation[1]),
                    L.latLng(destination.lat, destination.lng)
                ];
                
                routingControlRef.current = L.Routing.control({
                    waypoints: directWaypoints,
                    lineOptions: { styles: [{ color: '#3b82f6', weight: 4, opacity: 0.6, dashArray: '5, 10' }] },
                    addWaypoints: false,
                    draggableWaypoints: false,
                    show: false,
                    createMarker: () => null
                }).addTo(map);
                if (setLoading) setLoading(false);
            }
        };

        fetchRoute();

        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [userLocation, destination, map]); // Added userLocation back to ensure it triggers when GPS is ready

    return null;
};

// Helper component to auto-center map in navigation mode
const MapFollower = ({ userLocation, isNavMode, manualMove, setManualMove }) => {
    const map = useMap();
    
    useMapEvents({
        dragstart: () => setManualMove(true),
        zoomstart: () => setManualMove(true)
    });

    useEffect(() => {
        if (isNavMode && userLocation && map && !manualMove) {
            map.setView(userLocation, 18, { animate: true });
        }
    }, [userLocation, isNavMode, map, manualMove]);
    
    return null;
};

const SmartNavigationMap = ({ destination, onRouteUpdate, isNavMode }) => {
    const { userLocation, startSharing } = useLocationSharing();
    const [gridSectors, setGridSectors] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [manualMove, setManualMove] = useState(false);
    const mapRef = useRef(null);

    // Timeout for loading state
    useEffect(() => {
        const timer = setTimeout(() => setMapLoading(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        startSharing({ showPrompt: false });
        fetchGridStatus();
    }, [startSharing]);

    useWebSocket('/topic/grid-updates', (gridData) => {
        setGridSectors(gridData);
    });

    const fetchGridStatus = async () => {
        try {
            const res = await crowdService.getGridStatus();
            setGridSectors(res.data);
        } catch (e) {
            console.error("Failed to fetch grid", e);
        }
    };

    return (
        <div className="smart-map-wrapper" style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden' }}>
            {mapLoading && (
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    zIndex: 2000, 
                    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    gap: '15px'
                }}>
                    <Loader2 className="animate-spin" size={40} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Calculating Optimal Path...</span>
                </div>
            )}

            {manualMove && (
                <button 
                    onClick={() => {
                        setManualMove(false);
                        if (mapRef.current && userLocation) {
                            mapRef.current.setView(userLocation, 18, { animate: true });
                        }
                    }}
                    style={{ 
                        position: 'absolute', 
                        bottom: '20px', 
                        right: '20px', 
                        zIndex: 1000, 
                        padding: '12px', 
                        background: 'white', 
                        borderRadius: '50%', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Locate size={24} color="#4285F4" />
                </button>
            )}

            <MapContainer
                center={[20.0051, 73.7896]}
                zoom={15}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false}
                attributionControl={false}
                ref={mapRef}
            >
                {/* Google Maps Live Hybrid Tiles */}
                <TileLayer 
                    url="https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                />
                
                <MapFollower 
                    userLocation={userLocation} 
                    isNavMode={isNavMode} 
                    manualMove={manualMove} 
                    setManualMove={setManualMove} 
                />

                <RouteLayer 
                    userLocation={userLocation} 
                    destination={destination} 
                    setLoading={setMapLoading}
                    onRouteUpdate={(info) => {
                        setRouteInfo(info);
                        if (onRouteUpdate) onRouteUpdate(info);
                    }} 
                />

                {/* User Marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={createUserIcon()}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {/* Grid Sectors */}
                {gridSectors.map(sector => (
                    <Polygon
                        key={sector.id}
                        positions={sector.boundary?.coordinates?.[0]?.map(c => [c[1], c[0]]) || []}
                        pathOptions={{
                            fillColor: sector.status === 'RED' ? '#ef4444' : sector.status === 'YELLOW' ? '#f59e0b' : '#10b981',
                            fillOpacity: (sector.currentDensity / 100) + 0.1,
                            color: 'transparent',
                            weight: 0
                        }}
                    >
                        <Tooltip sticky>
                            <div className="p-1 text-[10px] font-bold">
                                Density: {sector.currentDensity} users<br />
                                Status: {sector.status}
                            </div>
                        </Tooltip>
                    </Polygon>
                ))}

                {/* Destination Marker */}
                {destination && (
                    <Marker position={[destination.lat, destination.lng]} icon={createPulsingIcon('RED')}>
                        <Popup>{destination.name}</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Floating Intelligence Card */}
            {routeInfo && (
                <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px', 
                    zIndex: 1000, 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(10px)',
                    padding: '15px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    width: '240px',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <div style={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: routeInfo.safetyStatus === 'RED' ? '#fee2e2' : '#dcfce7',
                            color: routeInfo.safetyStatus === 'RED' ? '#ef4444' : '#10b981'
                        }}>
                            {routeInfo.safetyStatus === 'RED' ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>Route Intelligence</h4>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                {routeInfo.safetyStatus} ZONE DETECTED
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '12px' }}>
                        <span style={{ color: '#64748b' }}>Distance</span>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{routeInfo.distance.toFixed(2)} km</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '5px' }}>
                        <span style={{ color: '#64748b' }}>Est. Time</span>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{routeInfo.duration} mins</span>
                    </div>
                    {routeInfo.warnings && routeInfo.warnings.length > 0 && (
                        <div style={{ 
                            marginTop: '12px', 
                            padding: '8px', 
                            backgroundColor: '#fff1f2', 
                            borderRadius: '6px', 
                            fontSize: '9px', 
                            color: '#be123c',
                            fontWeight: '600' 
                        }}>
                            {routeInfo.warnings[0]}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SmartNavigationMap;
