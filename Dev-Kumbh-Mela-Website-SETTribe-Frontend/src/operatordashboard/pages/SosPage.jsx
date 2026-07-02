import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import { emergencyService } from '../../api/services/emergencyService';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import SosMap from '../../components/SosMap';
import { useWebSocket } from '../../hooks/useWebSocket';

const SosPage = () => {
    const { user } = useAuth();
    const [sosAlertsList, setSosAlertsList] = useState([]);
    const [sosCurrentPage, setSosCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const entriesPerPage = 10;

    const fetchSosAlerts = async (page = 1, search = '') => {
        try {
            setError('');
            const response = await emergencyService.getSosList(page - 1, entriesPerPage, search);
            const data = response.data;
            
            if (data && data.content !== undefined) {
                setSosAlertsList(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                const list = Array.isArray(data) ? data : [];
                setSosAlertsList(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (err) {
            console.warn('SOS fetch failed:', err);
            const mockData = [
                { id: 42, alertId: 'SOS-042', location: 'Ram Kund, Sector 4', latitude: 20.0063, longitude: 73.7891, emergencyType: 'Medical Emergency', priority: 'High', status: 'Resolving', acceptedBy: 'Operator Alpha', reportedTime: new Date(Date.now() - 600000).toISOString() },
                { id: 41, alertId: 'SOS-041', location: 'Sadhu Gram, Gate 2', latitude: 20.0115, longitude: 73.7947, emergencyType: 'Lost Person', priority: 'Medium', status: 'Pending', reportedTime: new Date(Date.now() - 3600000).toISOString() },
                { id: 40, alertId: 'SOS-040', location: 'Tapovan, Area B', latitude: 20.0055, longitude: 73.8050, emergencyType: 'Fire Hazard', priority: 'High', status: 'Resolved', acceptedBy: 'Operator Beta', resolvedBy: 'HQ Admin', reportedTime: new Date(Date.now() - 7200000).toISOString() }
            ];
            setSosAlertsList(mockData);
            setTotalElements(mockData.length);
            setTotalPages(1);
            setError('Showing mock data as backend is unreachable.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSosAlerts(sosCurrentPage, searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [sosCurrentPage, searchTerm]);

    useEffect(() => {
        setSosCurrentPage(1);
    }, [searchTerm]);

    useWebSocket('/topic/sos', () => {
        fetchSosAlerts(sosCurrentPage, searchTerm);
    });

    const handleAcceptAlert = async (id) => {
        Swal.fire({
            title: 'Accept Emergency Alert?',
            text: 'Marking this as accepted means assistance is being dispatched.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#2E7D32',
            cancelButtonColor: '#795d4d',
            confirmButtonText: 'Yes, DISPATCH AID',
            background: '#ffffff',
            borderRadius: '24px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await emergencyService.acceptEmergency(id, user?.name || user?.email);
                    if (response.status === 200 || response.status === 201) {
                        Swal.fire({
                            title: 'Status Updated',
                            text: 'An operator has been assigned to this alert.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            background: '#ffffff',
                            borderRadius: '24px'
                        });
                        fetchSosAlerts();
                    }
                } catch (acceptError) {
                    console.error('Failed to accept alert:', acceptError);
                    Swal.fire({ title: 'Update failed', text: 'The backend could not accept this alert.', icon: 'error' });
                }
            }
        });
    };

    const handleResolveAlert = async (id) => {
        Swal.fire({
            title: 'Resolve Emergency?',
            text: 'Has the situation been fully addressed and closed?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff7e36',
            cancelButtonColor: '#795d4d',
            confirmButtonText: 'Yes, RESOLVE NOW',
            background: '#ffffff',
            borderRadius: '24px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await emergencyService.resolveEmergency(id, user?.name || user?.email || 'Operator');
                    if (response.status === 200 || response.status === 201) {
                        Swal.fire({
                            title: 'Emergency Resolved',
                            text: 'The status has been updated to Resolved.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            background: '#ffffff',
                            borderRadius: '24px'
                        });
                        fetchSosAlerts();
                    }
                } catch (resolveError) {
                    console.error('Failed to resolve alert:', resolveError);
                    Swal.fire({ title: 'Update failed', text: 'The backend could not resolve this alert.', icon: 'error' });
                }
            }
        });
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
                <div className="dashboard-header-modern">
                    <h1 className="page-title">SOS Command Center</h1>
                </div>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos">
                        <div className="marker-inner"></div>
                    </div>
                    <div>
                        <h2 className="title-static">Command Center</h2>
                        <span className="subtitle-static">Live emergency channel</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed">
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Alerts</span>
                        </div>
                    </div>
                    <div className="metric-box-fixed pending">
                        
                        <div className="m-vals">
                            <span className="digit">{sosAlertsList.filter((s) => (s.status || '').toLowerCase() === 'pending').length}</span>
                            <span className="lab">Page New</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Search SOS by ID, Type, Status or Priority..." 
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
                    <thead>
                        <tr>
                            <th>Alert ID</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Priority</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && sosAlertsList.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center p-8">
                                    <div className="waiting-sos">
                                        <div className="pulse-slow ring-sos"></div>
                                        <p>No SOS alerts matching your search.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sosAlertsList.map((sos) => (
                                <tr key={sos.id} className={(sos.status || '').toLowerCase() === 'pending' ? 'new-alert-row-premium' : ''}>
                                    <td><span className={`id-badge-stress ${(sos.status || '').toLowerCase() === 'pending' ? 'animate-pulse-glow' : ''}`}>{sos.alertId || sos.id}</span></td>
                                    <td className="sos-map-cell">
                                        <SosMap 
                                            latitude={sos.latitude} 
                                            longitude={sos.longitude} 
                                            locationName={sos.location} 
                                            status={sos.status}
                                        />
                                    </td>
                                    <td><span className="emergency-type-tag">{sos.emergencyType || 'General SOS'}</span></td>
                                    <td><span className={`priority-pill priority-${(sos.priority || 'Medium').toLowerCase()}`}>{sos.priority || 'Medium'}</span></td>
                                    <td className="timestamp-cell">{sos.reportedTime ? new Date(sos.reportedTime).toLocaleString() : 'Recent'}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className={`status-pill status-${(sos.status || '').toLowerCase()}`}>{sos.status}</span>
                                            {sos.acceptedBy && (
                                                <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                    Acc by: <b>{sos.acceptedBy}</b>
                                                </span>
                                            )}
                                            {sos.resolvedBy && (
                                                <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                    Res by: <b>{sos.resolvedBy}</b>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-btns-group-premium">
                                            {(sos.status || '').toLowerCase() === 'pending' && (
                                                <button className="accept-btn-luxury" onClick={() => handleAcceptAlert(sos.id)}>Accept Mission</button>
                                            )}
                                            {((sos.status || '').toLowerCase() === 'accepted' || (sos.status || '').toLowerCase() === 'resolving') && (
                                                <button className="resolve-btn-luxury" onClick={() => handleResolveAlert(sos.id)}>Mark Resolved</button>
                                            )}
                                            {(sos.status || '').toLowerCase() === 'resolved' && (
                                                <span className="verified-success">Cleared</span>
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
                        disabled={sosCurrentPage === 1} 
                        onClick={() => setSosCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                        Previous
                    </button>
                    <div className="pager-info">
                        Page <strong>{sosCurrentPage}</strong> of {totalPages}
                    </div>
                    <button 
                        className="pager-btn" 
                        disabled={sosCurrentPage >= totalPages} 
                        onClick={() => setSosCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SosPage;
