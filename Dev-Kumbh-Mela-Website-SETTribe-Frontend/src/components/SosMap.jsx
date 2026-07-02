import React, { memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/SosMap.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom SOS Marker Icon Generator
const getSosIcon = (status) => {
    const isResolved = (status || '').toLowerCase() === 'resolved';
    const pinColor = isResolved ? '#2e7d32' : '#ef4444'; // Green for resolved, Red for active
    
    return L.divIcon({
        className: 'sos-custom-marker',
        html: `<div class="sos-marker-pin" style="background: ${pinColor};">
                ${!isResolved ? '<div class="sos-marker-pulse"></div>' : ''}
                <div class="sos-marker-inner">SOS</div>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });
};

// Component to handle auto-centering when coordinates change
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

const SosMap = ({ latitude, longitude, locationName, status }) => {
    const hasCoords = latitude && longitude && !isNaN(latitude) && !isNaN(longitude);
    const center = hasCoords ? [latitude, longitude] : [20.0115, 73.7947]; // Default to Nashik

    const markerIcon = React.useMemo(() => getSosIcon(status), [status]);

    if (!hasCoords) {
        return (
            <div className="sos-map-fallback">
                <div className="fallback-icon"></div>
                <div className="fallback-text">
                    <span className="location-label">{locationName || 'Unknown Location'}</span>
                    <span className="coords-missing">GPS Coordinates Unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <div className="sos-map-wrapper">
            <div className="sos-map-container">
                <MapContainer 
                    center={center} 
                    zoom={15} 
                    scrollWheelZoom={false} 
                    zoomControl={false}
                    dragging={true}
                    doubleClickZoom={false}
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <ChangeView center={center} zoom={15} />
                    <Marker position={center} icon={markerIcon}>
                        <Popup>
                            <div className="sos-popup-content">
                                <strong>SOS Location</strong><br />
                                {locationName || 'Precise GPS Location'}<br />
                                <small>{latitude.toFixed(6)}, {longitude.toFixed(6)}</small>
                                <div style={{ marginTop: '10px' }}>
                                    <a 
                                        href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="full-map-link"
                                    >
                                        View in Google Maps
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
                <div className="map-overlay-info">
                    <span className="map-location-name">{locationName || 'GPS Location'}</span>
                    <span className="map-coords">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                </div>
                <a 
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-interaction-hint"
                >
                    View Full Map
                </a>
            </div>
        </div>
    );
};

export default memo(SosMap);
