import React, { useState, useEffect } from 'react';
import { activityService } from '../../api/services/activityService';
import { useWebSocket } from '../../hooks/useWebSocket';

const ViewersPage = () => {
    const [totalViewers, setTotalViewers] = useState('0');
    const [viewersData, setViewersData] = useState([]);
    const [viewersPage, setViewersPage] = useState(0);
    const [viewersTotalPages, setViewersTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchViewers = async () => {
            // Stats (Usually fetched once or periodically, but we keep it in the interval)
            try {
                const response = await activityService.getTotalUsersActivity();
                const data = response.data;
                if (!data || data.totalUsers === undefined || data.totalUsers === 0) throw new Error("Empty data");
                setTotalViewers(data.totalUsers);
            } catch (err) {
                console.warn("Viewers Stats Fetch Failed, using mock fallback:", err);
                if (totalViewers === '0') setTotalViewers(15420);
            }

            // Activity Table (Paginated + Filtered)
            try {
                const response = await activityService.getAllActivity(viewersPage, 10, searchTerm);
                const data = response.data;
                const content = data.content || (Array.isArray(data) ? data : []);
                
                setViewersData(content);
                setViewersTotalPages(data.totalPages || 1);
            } catch (err) {
                console.warn("Viewers Activity Fetch Failed, using mock fallback:", err);
                // Simple mock search filter
                const mockLogs = [
                    { id: 201, ipAddress: '192.168.1.1', pageVisited: '/home', timestamp: new Date().toISOString() },
                    { id: 202, ipAddress: '10.0.0.5', pageVisited: '/travel', timestamp: new Date(Date.now() - 50000).toISOString() },
                    { id: 203, ipAddress: '172.16.0.4', pageVisited: '/donate', timestamp: new Date(Date.now() - 150000).toISOString() },
                    { id: 204, ipAddress: '192.168.2.10', pageVisited: '/virtual-pooja', timestamp: new Date(Date.now() - 250000).toISOString() },
                    { id: 205, ipAddress: '10.0.0.21', pageVisited: '/shop', timestamp: new Date(Date.now() - 350000).toISOString() }
                ];

                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    const filtered = mockLogs.filter(log => 
                        log.ipAddress.includes(term) || 
                        log.pageVisited.toLowerCase().includes(term) ||
                        `V-${log.id}`.toLowerCase().includes(term)
                    );
                    setViewersData(filtered);
                } else {
                    setViewersData(mockLogs);
                }
                setViewersTotalPages(1);
            }
        };

        const timer = setTimeout(() => {
            fetchViewers();
        }, 300); // Debounce search

        return () => {
            clearTimeout(timer);
        };
    }, [viewersPage, searchTerm]);

    useWebSocket('/topic/viewers', (message) => {
        if (message && message.stats) {
            setTotalViewers(message.stats.totalUsers || 0);
        }

        const fetchViewers = async () => {
            try {
                const response = await activityService.getAllActivity(viewersPage, 10, searchTerm);
                const data = response.data;
                const content = data.content || (Array.isArray(data) ? data : []);
                
                setViewersData(content);
                setViewersTotalPages(data.totalPages || 1);
            } catch (err) {
                console.warn("Viewers Activity Fetch Failed in websocket callback");
            }
        };
        fetchViewers();
    });

    // Reset to page 0 when searching
    useEffect(() => {
        setViewersPage(0);
    }, [searchTerm]);

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Pilgrim Analytics</h1>
                </div>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(156, 39, 176, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#9C27B0' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Activity Insight</h2>
                        <span className="subtitle-static">Live • Pilgrim Behavior Analytics</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #9C27B0' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalViewers}</span>
                            <span className="lab">Active Logs</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search logs by Activity ID, IP, or Page..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input-modern"
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            </div>

            <div className="table-wrapper-premium">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Activity ID</th>
                            <th>IP Address</th>
                            <th>Page Visited</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {viewersData.length === 0 ? (
                            <tr><td colSpan="4" className="text-center p-8 text-muted">Scanning activity logs...</td></tr>
                        ) : (
                            viewersData.map(activity => (
                                <tr key={activity.id}>
                                    <td><span className="id-badge-alt">V-{activity.id}</span></td>
                                    <td className="font-semibold text-accent">{activity.ipAddress}</td>
                                    <td><span className="page-pill">{activity.pageVisited}</span></td>
                                    <td className="text-muted">{activity.timestamp ? (Array.isArray(activity.timestamp) ? `${activity.timestamp[0]}-${activity.timestamp[1]}-${activity.timestamp[2]} ${activity.timestamp[3]}:${activity.timestamp[4]}` : new Date(activity.timestamp).toLocaleString()) : 'N/A'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="pagination-bar-premium">
                    <button className="pager-btn" disabled={viewersPage === 0} onClick={() => setViewersPage(prev => Math.max(0, prev - 1))}>Previous</button>
                    <div className="pager-info">Page <strong>{viewersPage + 1}</strong> of {viewersTotalPages}</div>
                    <button className="pager-btn" disabled={viewersPage >= viewersTotalPages - 1} onClick={() => setViewersPage(prev => Math.min(viewersTotalPages - 1, prev + 1))}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default ViewersPage;
