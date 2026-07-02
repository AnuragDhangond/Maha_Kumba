import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { crowdService } from '../../api/services/crowdService';
import { translations } from '../../utils/translations';
import HeadingOrnament from '../../components/HeadingOrnament';
import { Save, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/CrowdMap.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import 'leaflet.heat';

const HeatmapLayer = ({ locations, livePings }) => {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        const locationHeat = locations.map(loc => [
            loc.latitude, 
            loc.longitude, 
            loc.crowdLevel === 'RED' ? 1.0 : loc.crowdLevel === 'YELLOW' ? 0.6 : 0.3
        ]);
        const pingHeat = Object.values(livePings || {}).map(ping => [ping.latitude, ping.longitude, 0.8]);
        const heatData = [...locationHeat, ...pingHeat];

        const heatLayer = L.heatLayer(heatData, { 
            radius: 35, 
            blur: 15, 
            maxZoom: 17,
            max: 1.0 
        }).addTo(map);
        return () => map.removeLayer(heatLayer);
    }, [locations, livePings, map]);
    return null;
};

const CrowdManagementPage = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [locations, setLocations] = useState([]);
    const [livePings, setLivePings] = useState({});
    const [stats, setStats] = useState({ totalLiveUsers: 0, highDensityZones: 0, avgPilgrimsPerSite: 0 });
    const [lang] = useState(localStorage.getItem('preferredLang') || 'en');
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchCrowdStatus = async (forceRecalculate = false) => {
        try {
            setLoading(true);
            if (forceRecalculate) {
                await crowdService.refreshDensity();
            }

            const locResponse = await crowdService.getCrowdStatus();
            setLocations(locResponse.data);

            const pingResponse = await crowdService.getLivePings();
            const pingsObj = {};
            pingResponse.data.forEach(p => pingsObj[p.deviceId] = p);
            setLivePings(pingsObj);

            if (forceRecalculate) {
                Swal.fire({
                    title: 'Data Synced!',
                    text: 'Real-time density recalculated from latest GPS pings.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        } catch (error) {
            console.error("Error fetching crowd status:", error);
            // Fallback for demo
            setLocations([
                { id: 1, locationName: "Ramkund Ghat", latitude: 20.0051, longitude: 73.7896, crowdLevel: "RED", currentVisitorCount: 450, lastUpdated: new Date() },
                { id: 2, locationName: "Kalaram Temple", latitude: 20.0069, longitude: 73.7915, crowdLevel: "YELLOW", currentVisitorCount: 200, lastUpdated: new Date() },
                { id: 3, locationName: "Tapovan Area", latitude: 20.0069, longitude: 73.8166, crowdLevel: "GREEN", currentVisitorCount: 80, lastUpdated: new Date() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrowdStatus(false);

        const client = new Client({
            webSocketFactory: () => new SockJS(`http://${window.location.hostname}:8080/ws-crowd`),
            onConnect: () => {
                console.log('Admin: Connected to Live Analytics');
                client.subscribe('/topic/crowd-stats', (message) => {
                    setStats(JSON.parse(message.body));
                });
                client.subscribe('/topic/crowd-updates', (message) => {
                    const updatedLocation = JSON.parse(message.body);
                    setLocations(prev => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
                });
                client.subscribe('/topic/live-traffic', (message) => {
                    const ping = JSON.parse(message.body);
                    setLivePings(prev => ({ ...prev, [ping.deviceId]: ping }));
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
            debug: (str) => console.log(str)
        });

        client.activate();
        return () => client.deactivate();
    }, []);

    const updateLevel = async (id, newLevel) => {
        try {
            setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, crowdLevel: newLevel, manualOverride: true } : loc));
            await crowdService.updateCrowdStatus(id, newLevel);
            fetchCrowdStatus(false);
            Swal.fire({
                title: 'Override Active!',
                text: `Location level set to ${newLevel}. Auto-updates disabled for this site.`,
                icon: 'warning',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Update failed", error);
            Swal.fire('Update Failed', 'Server error while updating crowd level.', 'error');
        }
    };

    const releaseOverride = async (id) => {
        try {
            await crowdService.releaseOverride(id);
            fetchCrowdStatus(false);
            Swal.fire({
                title: 'Auto-Mode Active',
                text: 'System is now tracking real GPS density again.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Release failed", error);
            Swal.fire('Release Failed', 'Server error while releasing override.', 'error');
        }
    };

    const t = translations[lang] || translations['en'];

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

    return (
        <div style={{ padding: isMobile ? '10px' : '20px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'start' : 'end', 
                    marginBottom: '40px', 
                    background: 'white', 
                    padding: isMobile ? '20px' : '30px', 
                    borderRadius: '24px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                    gap: isMobile ? '20px' : '0'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#4a2a18', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <h4 style={{ margin: 0, color: '#4a2a18', fontSize: '0.9rem', letterSpacing: '1px' }}>SECURITY COMMAND CENTER</h4>
                        </div>
                        <h1 style={{ fontFamily: 'Cinzel, serif', color: '#1e293b', fontSize: isMobile ? '2rem' : '2.8rem', margin: '0 0 10px 0', lineHeight: 1 }}>CROWD ANALYTICS</h1>
                        <p style={{ color: '#64748b', fontWeight: '500', margin: 0, fontSize: isMobile ? '0.8rem' : '1rem' }}>Real-time GPS density monitoring for Nashik 2027.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', width: isMobile ? '100%' : 'auto' }}>
                        <div style={{ textAlign: isMobile ? 'left' : 'right', paddingRight: isMobile ? '0' : '20px', borderRight: isMobile ? 'none' : '1px solid #e2e8f0', marginBottom: isMobile ? '10px' : '0' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>SYSTEM STATUS</div>
                            <div style={{ color: '#22c55e', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                                LIVE SYNC ACTIVE
                            </div>
                        </div>
                        <button 
                            onClick={() => fetchCrowdStatus(true)}
                            style={{ 
                                background: '#1e293b', 
                                color: 'white', 
                                border: 'none', 
                                padding: '15px 25px', 
                                borderRadius: '14px', 
                                display: 'flex', 
                                gap: '10px', 
                                cursor: 'pointer', 
                                fontWeight: '600', 
                                transition: 'all 0.2s', 
                                boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
                                justifyContent: 'center'
                            }}
                        >
                            <RefreshCw size={20} className={loading ? 'spin' : ''} /> SYNC SYSTEM
                        </button>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
                    gap: '20px', 
                    marginBottom: '30px' 
                }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px' }}>TOTAL LIVE USERS</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>{stats.totalLiveUsers}</div>
                    </div>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px' }}>HIGH DENSITY ZONES</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>{stats.highDensityZones}</div>
                    </div>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px' }}>AVG. PILGRIMS/SITE</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#22c55e' }}>{stats.avgPilgrimsPerSite}</div>
                    </div>
                </div>

                {/* Map Section */}
                <div style={{ 
                    height: isMobile ? '400px' : '600px', 
                    width: '100%', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    marginBottom: '30px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                    border: isMobile ? '4px solid white' : '8px solid white',
                    position: 'relative'
                }}>
                    <MapContainer center={[20.0051, 73.7896]} zoom={isMobile ? 13 : 14} style={{ height: '100%', width: '100%' }} attributionControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <HeatmapLayer locations={locations} livePings={livePings} />
                        {locations.map(loc => (
                            <Marker 
                                key={loc.id} 
                                position={[loc.latitude, loc.longitude]} 
                                icon={createPulsingIcon(loc.crowdLevel)}
                            >
                                <Popup>
                                    <div style={{ textAlign: 'center', padding: '10px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Cinzel', color: '#4a2a18' }}>{loc.locationName}</h4>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => updateLevel(loc.id, 'GREEN')} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>SAFE</button>
                                            <button onClick={() => updateLevel(loc.id, 'YELLOW')} style={{ background: '#eab308', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>MOD</button>
                                            <button onClick={() => updateLevel(loc.id, 'RED')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>HIGH</button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                    <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        zIndex: 1000, 
                        background: 'rgba(255,255,255,0.9)', 
                        padding: '8px 12px', 
                        borderRadius: '12px', 
                        backdropFilter: 'blur(10px)', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        fontSize: '0.7rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#4a2a18' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></div>
                            {isMobile ? `LIVE: ${Object.keys(livePings).length}` : `LIVE TRAFFIC ACTIVE: ${Object.keys(livePings).length} USERS`}
                        </div>
                    </div>
                </div>

                {/* Historical Analytics Section */}
                <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '20px' : '30px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontFamily: 'Cinzel', color: '#4a2a18', marginBottom: '20px', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>📈 CROWD DENSITY TRENDS (24H)</h3>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={locations.map(l => ({ name: isMobile ? l.locationName.split(' ')[0].substring(0, 5) : l.locationName.split(' ')[0], count: l.currentVisitorCount || 0, level: l.crowdLevel }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#795d4d', fontSize: isMobile ? 10 : 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#795d4d', fontSize: isMobile ? 10 : 11 }} />
                                <RechartsTooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                    {locations.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.crowdLevel === 'RED' ? '#ef4444' : entry.crowdLevel === 'YELLOW' ? '#eab308' : '#22c55e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#795d4d', textAlign: 'center', marginTop: '10px' }}>
                        Live sensor data from pilgrims' GPS. Automatically detects density peaks across holy sites.
                    </p>
                </div>

                {/* Table Section */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isMobile ? '600px' : 'auto' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: isMobile ? '15px' : '25px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Location</th>
                                    {!isMobile && <th style={{ padding: '25px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Type</th>}
                                    <th style={{ padding: isMobile ? '15px' : '25px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Pilgrims</th>
                                    <th style={{ padding: isMobile ? '15px' : '25px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Density Level</th>
                                    <th style={{ padding: isMobile ? '15px' : '25px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Admin Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map(loc => (
                                    <tr key={loc.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: isMobile ? '15px' : '25px' }}>
                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: isMobile ? '0.85rem' : '1rem' }}>{loc.locationName}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}</div>
                                        </td>
                                        {!isMobile && (
                                            <td style={{ padding: '25px' }}>
                                                <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                                                    {loc.locationType || 'Site'}
                                                </span>
                                            </td>
                                        )}
                                        <td style={{ padding: isMobile ? '15px' : '25px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: (loc.currentVisitorCount || 0) > 0 ? '#22c55e' : '#e2e8f0' }}></div>
                                                <span style={{ fontWeight: '800', fontSize: isMobile ? '1rem' : '1.1rem', color: '#1e293b' }}>{loc.currentVisitorCount || 0}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: isMobile ? '15px' : '25px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <span style={{ 
                                                    padding: '8px 16px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '800',
                                                    background: loc.crowdLevel === 'RED' ? '#fee2e2' : loc.crowdLevel === 'YELLOW' ? '#fef9c3' : '#dcfce7',
                                                    color: loc.crowdLevel === 'RED' ? '#ef4444' : loc.crowdLevel === 'YELLOW' ? '#a16207' : '#15803d',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                                    {loc.crowdLevel}
                                                </span>
                                                {loc.manualOverride && (
                                                    <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <AlertTriangle size={12} /> MANUAL
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: isMobile ? '15px' : '25px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button 
                                                        onClick={() => updateLevel(loc.id, 'GREEN')}
                                                        style={{ background: '#dcfce7', color: '#15803d', border: 'none', padding: isMobile ? '6px 10px' : '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                                                    >{isMobile ? 'S' : 'SAFE'}</button>
                                                    <button 
                                                        onClick={() => updateLevel(loc.id, 'YELLOW')}
                                                        style={{ background: '#fef9c3', color: '#a16207', border: 'none', padding: isMobile ? '6px 10px' : '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                                                    >{isMobile ? 'W' : 'WARN'}</button>
                                                    <button 
                                                        onClick={() => updateLevel(loc.id, 'RED')}
                                                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: isMobile ? '6px 10px' : '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                                                    >{isMobile ? 'D' : 'DANGER'}</button>
                                                </div>
                                                {loc.manualOverride && (
                                                    <button 
                                                        onClick={() => releaseOverride(loc.id)}
                                                        title="Revert to Auto GPS Mode"
                                                        style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <RefreshCw size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Admin Notice Section */}
                <div style={{ marginTop: '40px', background: '#fee2e2', borderLeft: '5px solid #ef4444', padding: '20px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <AlertTriangle color="#ef4444" />
                        <div>
                            <h4 style={{ margin: 0, color: '#991b1b', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>Admin Notice</h4>
                            <p style={{ margin: '5px 0 0', fontSize: isMobile ? '0.75rem' : '0.9rem', color: '#b91c1c' }}>Updating status to <b>RED</b> will trigger automated safety advisories for users.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrowdManagementPage;
