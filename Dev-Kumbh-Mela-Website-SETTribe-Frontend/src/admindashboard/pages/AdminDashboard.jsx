import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyService } from '../../api/services/emergencyService';
import { activityService } from '../../api/services/activityService';
import { userService } from '../../api/services/userService';
import { liveDarshanService } from '../../api/services/liveDarshanService';
import donationTransactionService from '../../api/services/donationTransactionService';
import shopService from '../../operatordashboard/services/shopService';
import { hospitalService } from '../../api/services/hospitalService';
import { liveUpdateService } from '../../api/services/liveUpdateService';
import { crowdService } from '../../api/services/crowdService';
import { healthTipService } from '../../api/services/healthTipService';
import HealthSafetyPage from "../../components/HealthSafetyPage";
import { AlertTriangle } from "lucide-react";
import { UsersIcon, OrdersIcon, SosIcon } from "../components/AdminIcons";

// Inside the return JSX after existing cards, add a new card:
{/* 5. Health & Safety */}
<div className="stat-card" onClick={() => navigate('/admin-dashboard/health-safety')} style={{ '--card-accent': '#ff7e36' }}>
    <div className="stat-card-header">
        <div className="stat-icon" style={{ background: 'rgba(255, 126, 54, 0.1)', color: '#ff7e36' }}><AlertTriangle size={20} /></div>
        <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>Health & Safety</span>
    </div>
    <div className="stat-title">Health & Safety Map</div>
    <div className="stat-value">View</div>
    <div className="stat-progress"><div className="progress-bar" style={{ width: '100%', background: '#ff7e36' }} /></div>
    <div className="stat-footer">Click to open detailed map</div>
</div>
import '../../styles/AdminDashboard.css';
import { useWebSocket } from '../../hooks/useWebSocket';

// Simulate live server metrics with slight jitter each poll
const generateSystemResources = () => [
    { label: 'CPU', val: Math.min(99, Math.max(10, 62 + Math.round((Math.random() - 0.5) * 12))), color: '#f59e0b' },
    { label: 'RAM', val: Math.min(99, Math.max(10, 48 + Math.round((Math.random() - 0.5) * 10))), color: '#3b82f6' },
    { label: 'DB', val: Math.min(99, Math.max(10, 74 + Math.round((Math.random() - 0.5) * 8))), color: '#8b5cf6' },
    { label: 'NET', val: Math.min(99, Math.max(10, 50 + Math.round((Math.random() - 0.5) * 20))), color: '#10b981' },
    { label: 'DSK', val: Math.min(99, Math.max(10, 85 + Math.round((Math.random() - 0.5) * 6))), color: '#ef4444' },
    { label: 'CCH', val: Math.min(99, Math.max(10, 38 + Math.round((Math.random() - 0.5) * 14))), color: '#ec4899' },
    { label: 'API', val: Math.min(99, Math.max(10, 70 + Math.round((Math.random() - 0.5) * 10))), color: '#ff7e36' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();

    // --- Top Card Stats ---
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalViewers, setTotalViewers] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [viewerStats, setViewerStats] = useState({ newThisWeek: 0, percentage: 0 });
    const [sosAlertsList, setSosAlertsList] = useState([]);

    // --- Chart Data ---
    const [userRoles, setUserRoles] = useState({ pilgrim: 0, staff: 0, admin: 0 });
    const [userStatusStats, setUserStatusStats] = useState({ active: 0, inactive: 0, activeCount: 0, inactiveCount: 0 });
    const [weeklyTrend, setWeeklyTrend] = useState([]);
    const [darshanList, setDarshanList] = useState([]);
    const [donationMonths, setDonationMonths] = useState([]);
    const [sysResources, setSysResources] = useState(generateSystemResources());
    const [hospitalStats, setHospitalStats] = useState({ active: 0, full: 0, closed: 0, inactive: 0, total: 0 });
    const [liveUpdateStats, setLiveUpdateStats] = useState([]);
    const [crowdLocations, setCrowdLocations] = useState([]);
    const [healthTipStats, setHealthTipStats] = useState({ data: [], total: 0 });

    const fetchRealTimeStats = async () => {
        // 1. SOS Alerts
        try {
            const res = await emergencyService.getSosList(0, 1000);
            const data = res.data;
            const list = data.content || (Array.isArray(data) ? data : []);
            setSosAlertsList([...list].sort((a, b) => b.id - a.id));
        } catch (err) {
            console.warn('Real-time SOS failed:', err);
        }

        // 2. Real-time Visitors
        try {
            const res = await activityService.getTotalUsersActivity();
            const data = res.data;
            setTotalViewers(data.totalUsers || 0);
            setViewerStats({
                newThisWeek: data.newThisWeek || 0,
                percentage: data.percentage || 0,
            });
        } catch (err) {
            console.warn('Real-time Visitors failed:', err);
        }

        // 3. Registered Users
        try {
            const res = await userService.getUsers('', 0, 1000);
            const data = res.data;
            const list = data.content || (Array.isArray(data) ? data : []);
            setTotalUsers(data.totalElements || list.length);

            const pilgrim = list.filter(u => ['USER', 'PILGRIM'].includes((u.role || '').toUpperCase())).length;
            const staff = list.filter(u => ['STAFF', 'OPERATOR'].includes((u.role || '').toUpperCase())).length;
            const admin = list.filter(u => ['ADMIN', 'ADMINISTRATOR'].includes((u.role || '').toUpperCase())).length;
            const total = list.length || 1;

            setUserRoles({
                pilgrim: Math.round((pilgrim / total) * 100),
                staff: Math.round((staff / total) * 100),
                admin: 100 - Math.round((pilgrim / total) * 100) - Math.round((staff / total) * 100),
            });

            const activeCount = list.filter(u => u.isActive !== false).length;
            const inactiveCount = list.filter(u => u.isActive === false).length;
            setUserStatusStats({
                active: Math.round((activeCount / total) * 100),
                inactive: Math.round((inactiveCount / total) * 100),
                activeCount,
                inactiveCount,
            });
        } catch (err) {
            console.warn('Real-time Users failed:', err);
        }

        // 4. Total Orders
        try {
            const res = await shopService.getAllOrdersOperator({ page: 0, size: 1 });
            setTotalOrders(res.data.totalElements || 0);
        } catch (err) {
            console.warn('Real-time Orders failed:', err);
        }

        // 5. Crowd Density
        try {
            const res = await crowdService.getCrowdStatus();
            setCrowdLocations(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.warn('Real-time Crowd failed:', err);
        }

        // 6. Live Darshan Engagement
        try {
            const res = await liveDarshanService.getAllLiveDarshans('', 0, 20);
            const list = res.data.content || (Array.isArray(res.data) ? res.data : []);
            setDarshanList([...list].sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0)).slice(0, 4));
        } catch (err) {
            console.warn('Real-time Darshan failed:', err);
        }
    };

    const fetchPeriodicStats = async () => {
        // 1. Weekly Trend
        try {
            const res = await activityService.getAllActivity(0, 200);
            const list = res.data.content || (Array.isArray(res.data) ? res.data : []);
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const counts = Array(7).fill(0);
            const now = new Date();
            list.forEach(item => {
                const d = new Date(item.timestamp || item.createdAt || item.visitedAt);
                if (isNaN(d)) return;
                const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays < 7) counts[6 - diffDays] += 1;
            });
            const todayIdx = new Date().getDay();
            const orderedDays = Array.from({ length: 7 }, (_, i) => days[(todayIdx - 6 + i + 14) % 7]);
            setWeeklyTrend(orderedDays.map((day, i) => ({ day, count: counts[i] })));
        } catch (err) {
            console.warn('Periodic Trend failed:', err);
            const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
            setWeeklyTrend(days.map(d => ({ day: d, count: 0 })));
        }

        // 2. Donations Overview
        try {
            const res = await donationTransactionService.getAllDonations(0, 500);
            const list = Array.isArray(res) ? res : (res.content || []);
            const monthLabels = [];
            const monthTotals = {};
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                monthLabels.push({ key, label: d.toLocaleString('default', { month: 'short' }).toUpperCase() });
                monthTotals[key] = 0;
            }
            list.forEach(donation => {
                const d = new Date(donation.createdAt || donation.donationDate);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                if (monthTotals[key] !== undefined) monthTotals[key] += parseFloat(donation.amount || 0);
            });
            const maxVal = Math.max(...Object.values(monthTotals), 1);
            setDonationMonths(monthLabels.map(({ key, label }) => ({
                label, amount: monthTotals[key], pct: Math.round((monthTotals[key] / maxVal) * 100),
            })));
        } catch (err) {
            console.warn('Periodic Donations failed:', err);
        }

        // 3. Hospital Status
        try {
            const res = await hospitalService.getAllHospitals(0, 200);
            const list = res.data.content || (Array.isArray(res.data) ? res.data : []);
            const active = list.filter(h => (h.status || '').toLowerCase() === 'active').length;
            const full = list.filter(h => (h.status || '').toLowerCase() === 'full').length;
            const closed = list.filter(h => (h.status || '').toLowerCase() === 'closed').length;
            const inactive = list.filter(h => (h.status || '').toLowerCase() === 'inactive').length;
            setHospitalStats({ active, full, closed, inactive, total: list.length });
        } catch (err) {
            console.warn('Periodic Hospital failed:', err);
        }

        // 4. Live Updates
        try {
            const res = await liveUpdateService.getAllUpdates('', '', 0, 200);
            const list = res.data.content || (Array.isArray(res.data) ? res.data : []);
            const catMap = {};
            list.forEach(u => { const cat = u.category || 'OTHER'; catMap[cat] = (catMap[cat] || 0) + 1; });
            const maxCat = Math.max(...Object.values(catMap), 1);
            setLiveUpdateStats(Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => ({
                label: label.replace(/_/g, ' '), count, pct: Math.round((count / maxCat) * 100),
            })));
        } catch (err) {
            console.warn('Periodic Updates failed:', err);
        }

        // 5. Health Tips
        try {
            const res = await healthTipService.getAllTips();
            const list = Array.isArray(res.data) ? res.data : [];
            const catMap = {};
            list.forEach(t => { const cat = t.category || 'HEALTH'; catMap[cat] = (catMap[cat] || 0) + 1; });
            setHealthTipStats({ data: Object.entries(catMap).map(([label, value]) => ({ label, value })), total: list.length });
        } catch (err) {
            console.warn('Periodic HealthTips failed:', err);
        }
    };

    useEffect(() => {
        fetchRealTimeStats();
        fetchPeriodicStats();
        setSysResources(generateSystemResources());

        const rtInterval = setInterval(() => {
            fetchRealTimeStats();
            setSysResources(generateSystemResources());
        }, 5000);

        const pInterval = setInterval(fetchPeriodicStats, 30000);

        return () => {
            clearInterval(rtInterval);
            clearInterval(pInterval);
        };
    }, []);

    useWebSocket('/topic/sos', () => {
        emergencyService.getSosList(0, 1000).then(res => {
            const list = res.data.content || (Array.isArray(res.data) ? res.data : []);
            setSosAlertsList([...list].sort((a, b) => b.id - a.id));
        }).catch(err => console.warn(err));
    });

    useWebSocket('/topic/viewers', (message) => {
        if (message && message.stats) {
            setTotalViewers(message.stats.totalUsers || 0);
            setViewerStats({
                newThisWeek: message.stats.newThisWeek || 0,
                percentage: message.stats.percentage || 0,
            });
        }
    });

    // --- Derived SOS Stats ---
    const pendingCount = sosAlertsList.filter(s => (s.status || '').toLowerCase() === 'pending').length;
    const resolvingCount = sosAlertsList.filter(s => ['accepted', 'resolving', 'in_progress'].includes((s.status || '').toLowerCase())).length;
    const resolvedCount = sosAlertsList.filter(s => (s.status || '').toLowerCase() === 'resolved').length;
    const sosTotal = sosAlertsList.length || 1;
    const pendingPct = Math.round((pendingCount / sosTotal) * 100);
    const resolvingPct = Math.round((resolvingCount / sosTotal) * 100);
    const resolvedPct = 100 - pendingPct - resolvingPct;

    // --- Weekly Trend SVG Path ---
    const buildTrendPath = (trend) => {
        if (!trend || trend.length === 0) return { area: '', line: '' };
        const max = Math.max(...trend.map(t => t.count), 1);
        const w = 400, h = 200, pad = 20;
        const points = trend.map((t, i) => ({
            x: (i / (trend.length - 1)) * (w - 2 * pad) + pad,
            y: h - pad - ((t.count / max) * (h - 2 * pad)),
        }));
        const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
        const last = points[points.length - 1];
        return { area, line, lastX: last.x, lastY: last.y };
    };
    const trend = buildTrendPath(weeklyTrend);

    // --- Darshan color palette ---
    const darshanColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
    const maxDarshan = Math.max(...darshanList.map(d => d.viewerCount || d.viewers || 1), 1);

    // --- Hospital chart colors ---
    const hospitalPie = [
        { label: 'Active', value: hospitalStats.active, color: '#10b981' },
        { label: 'Full', value: hospitalStats.full, color: '#f59e0b' },
        { label: 'Closed', value: hospitalStats.closed, color: '#ef4444' },
        { label: 'Inactive', value: hospitalStats.inactive, color: '#94a3b8' },
    ].filter(h => h.value > 0);
    const hospTotal = hospitalStats.total || 1;
    let hospitalConic = '';
    let cumulativePct = 0;
    hospitalPie.forEach(seg => {
        const pct = Math.round((seg.value / hospTotal) * 100);
        hospitalConic += `${seg.color} ${cumulativePct}% ${cumulativePct + pct}%, `;
        cumulativePct += pct;
    });
    if (hospitalConic) hospitalConic += `#e2e8f0 ${cumulativePct}% 100%`;

    // --- Live Update Category colors ---
    const updateCatColors = ['#ff7e36', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

    // --- Health Tips chart colors ---
    const healthTipPieColors = ['#0ea5e9', '#d946ef', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e'];
    let healthTipConic = '';
    let healthCumulativePct = 0;
    const healthTipTotal = healthTipStats.total || 1;
    healthTipStats.data.forEach((seg, idx) => {
        const pct = Math.round((seg.value / healthTipTotal) * 100);
        const color = healthTipPieColors[idx % healthTipPieColors.length];
        healthTipConic += `${color} ${healthCumulativePct}% ${healthCumulativePct + pct}%, `;
        healthCumulativePct += pct;
    });
    if (healthTipConic) healthTipConic += `#e2e8f0 ${healthCumulativePct}% 100%`;

    return (
        <div style={{ padding: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Dashboard</h1>
                </div>
            </div>

            {/* ── Top 4 Stat Cards ── */}
            <div className="summary-cards grid-4">
                <div className="stat-card" onClick={() => navigate('/admin-dashboard/users')} style={{ '--card-accent': 'var(--admin-accent)' }}>
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: 'rgba(255, 152, 0, 0.1)', color: 'var(--admin-accent)' }}><UsersIcon /></div>
                        <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>Live DB</span>
                    </div>
                    <div className="stat-title">Total Registered</div>
                    <div className="stat-value">{totalUsers}</div>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: `${Math.min((totalUsers / 100) * 100, 100)}%`, background: 'var(--admin-accent)' }}></div>
                    </div>
                    <div className="stat-footer">{userRoles.pilgrim}% are pilgrims</div>
                </div>

                <div className="stat-card" onClick={() => navigate('/admin-dashboard/viewers')} style={{ '--card-accent': '#3b82f6' }}>
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><UsersIcon /></div>
                        <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>
                            {viewerStats.percentage > 0 ? '↑' : '↓'} {Math.abs(viewerStats.percentage)}%
                        </span>
                    </div>
                    <div className="stat-title">Real-time Visitors</div>
                    <div className="stat-value">{totalViewers}</div>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: `${Math.min(viewerStats.percentage, 100)}%`, background: '#3b82f6' }}></div>
                    </div>
                    <div className="stat-footer">{viewerStats.newThisWeek} new this week</div>
                </div>

                <div className="stat-card" onClick={() => navigate('/admin-dashboard/orders')} style={{ '--card-accent': '#10b981' }}>
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><OrdersIcon /></div>
                        <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>Live DB</span>
                    </div>
                    <div className="stat-title">Total Orders</div>
                    <div className="stat-value">{totalOrders}</div>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: `${Math.min((totalOrders / 500) * 100, 100)}%`, background: '#10b981' }}></div>
                    </div>
                    <div className="stat-footer">{totalOrders} total shop orders</div>
                </div>

                <div className="stat-card" onClick={() => navigate('/admin-dashboard/sos')} style={{ '--card-accent': '#ef4444' }}>
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', position: 'relative' }}>
                            <div className={pendingCount > 0 ? 'sos-blink' : ''} style={{ display: 'flex' }}>
                                <SosIcon />
                            </div>
                            {pendingCount > 0 && <div className="sos-indicator-dot"></div>}
                        </div>
                        <span className={`status-pill status-pending ${pendingCount > 0 ? 'sos-blink' : ''}`} style={{ fontSize: '0.65rem' }}>
                            {pendingCount} Pending
                        </span>
                    </div>
                    <div className="stat-title">SOS Alerts</div>
                    <div className="stat-value">{sosAlertsList.length}</div>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: `${pendingPct}%`, background: '#ef4444' }}></div>
                    </div>
                    <div className="stat-footer">Resolving {resolvingCount} help requests</div>
                </div>
            </div>

            {/* ── Charts Grid ── */}
            <div className="dashboard-visuals animate-fade-in">
                <div className="visual-card">
                    <h3 className="visual-title">Pilgrim Demographics</h3>
                    <div className="pie-chart-container">
                        <div className="pie-chart" style={{
                            background: `conic-gradient(
                                var(--chart-pilgrim) 0% ${userRoles.pilgrim}%, 
                                var(--chart-operator) ${userRoles.pilgrim}% ${userRoles.pilgrim + userRoles.staff}%, 
                                var(--chart-admin) ${userRoles.pilgrim + userRoles.staff}% 100%
                            )`
                        }}>
                            <div className="pie-center">
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--admin-text)' }}>{totalUsers}</span>
                                <span style={{ fontSize: '0.75rem', opacity: '0.8', fontWeight: 'bold', color: 'var(--admin-text)' }}>TOTAL</span>
                            </div>
                        </div>
                        <div className="pie-legend">
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: 'var(--chart-pilgrim)' }}></div>
                                <div className="legend-info">
                                    <span className="legend-label">Users</span>
                                    <span className="legend-value">{userRoles.pilgrim}%</span>
                                </div>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: 'var(--chart-operator)' }}></div>
                                <div className="legend-info">
                                    <span className="legend-label">Operators</span>
                                    <span className="legend-value">{userRoles.staff}%</span>
                                </div>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: 'var(--chart-admin)' }}></div>
                                <div className="legend-info">
                                    <span className="legend-label">Admins</span>
                                    <span className="legend-value">{userRoles.admin}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="visual-card">
                    <h3 className="visual-title">Visitor Trend (Live)</h3>
                    <div className="graph-container">
                        <svg className="graph-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="graph-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-pilgrim)" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="var(--chart-pilgrim)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {trend.area && <path className="graph-area" d={trend.area} />}
                            {trend.line && <path className="graph-path" d={trend.line} />}
                            {trend.lastX !== undefined && (
                                <circle cx={trend.lastX} cy={trend.lastY} r="6" fill="var(--chart-pilgrim)">
                                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                                </circle>
                            )}
                        </svg>
                        <div className="graph-labels">
                            {weeklyTrend.map((t, i) => <span key={i}>{t.day}</span>)}
                        </div>
                    </div>
                </div>

                <div className="visual-card">
                    <h3 className="visual-title">SOS Alerts Breakdown</h3>
                    <div className="pie-chart-container">
                        <div className="pie-chart" style={{
                            background: `conic-gradient(
                                var(--chart-pending) 0% ${pendingPct}%, 
                                var(--chart-resolving) ${pendingPct}% ${pendingPct + resolvingPct}%, 
                                var(--chart-resolved) ${pendingPct + resolvingPct}% 100%
                            )`
                        }}>
                            <div className="pie-center">
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--admin-text)' }}>{sosAlertsList.length}</span>
                                <span style={{ fontSize: '0.75rem', opacity: '0.5', fontWeight: 'bold', color: 'var(--admin-text)' }}>TOTAL</span>
                            </div>
                        </div>
                        <div className="pie-legend">
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: 'var(--chart-pending)' }}></div>
                                <div className="legend-info">
                                    <span className="legend-label">Pending</span>
                                    <span className="legend-value">{pendingPct}%</span>
                                </div>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: 'var(--chart-resolving)' }}></div>
                                <div className="legend-info">
                                    <span className="legend-label">Resolving</span>
                                    <span className="legend-value">{resolvingPct}%</span>
                                </div>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: 'var(--chart-resolved)' }}></div>
                                <div className="legend-info">
                                    <span className="legend-label">Resolved</span>
                                    <span className="legend-value">{resolvedPct}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="visual-card">
                    <h3 className="visual-title">Donations Overview</h3>
                    <div className="graph-container" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '15px 10px 0', height: '140px', gap: '15px' }}>
                        {donationMonths.length > 0 ? donationMonths.map((item, idx) => (
                            <div key={idx} style={{
                                flex: 1, maxWidth: '40px', height: `${item.pct || 5}%`,
                                background: `linear-gradient(180deg, #10b981 0%, rgba(16,185,129,0.1) 100%)`,
                                borderRadius: '4px', position: 'relative', transition: 'height 1s ease',
                                border: '1px solid rgba(16,185,129,0.2)'
                            }}>
                                <span style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', fontWeight: 'bold', color: '#10b981', whiteSpace: 'nowrap' }}>
                                    ₹{item.amount >= 1000 ? (item.amount / 1000).toFixed(0) + 'k' : item.amount}
                                </span>
                            </div>
                        )) : [0,0,0,0,0,0].map((_, i) => <div key={i} style={{ flex: 1, maxWidth: '40px', height: '5%', background: 'rgba(16,185,129,0.1)', borderRadius: '4px' }}></div>)}
                    </div>
                    <div className="graph-labels" style={{ marginTop: '0', paddingTop: '15px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', paddingLeft: '10px', paddingRight: '10px' }}>
                        {donationMonths.map((m, i) => <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: 'var(--admin-text)' }}>{m.label}</span>)}
                    </div>
                </div>

                <div className="visual-card" onClick={() => navigate('/admin-dashboard/crowd')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 className="visual-title" style={{ margin: 0 }}>Crowd Status</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {[{ label: 'Safe', color: '#22c55e' }, { label: 'Warn', color: '#eab308' }, { label: 'High', color: '#ef4444' }].map((lvl, i) => (
                                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: '700', color: 'var(--admin-text)', opacity: 0.7 }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: lvl.color, display: 'inline-block', flexShrink: 0 }}></span>
                                    {lvl.label}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {[
                            { label: 'Safe Zones', count: crowdLocations.filter(l => l.crowdLevel === 'GREEN').length, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                            { label: 'Moderate', count: crowdLocations.filter(l => l.crowdLevel === 'YELLOW').length, color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
                            { label: 'High Risk', count: crowdLocations.filter(l => l.crowdLevel === 'RED').length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                        ].map((stat, i) => (
                            <div key={i} style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', background: stat.bg, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: stat.color, fontFamily: 'var(--font-dashboard-heading)', lineHeight: 1 }}>{stat.count}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--admin-text)', opacity: 0.6, marginTop: '3px', textTransform: 'uppercase' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {crowdLocations.length > 0 ? crowdLocations.map((loc, idx) => {
                            const levelColor = loc.crowdLevel === 'RED' ? '#ef4444' : loc.crowdLevel === 'YELLOW' ? '#eab308' : '#22c55e';
                            const maxCount = Math.max(...crowdLocations.map(l => l.currentVisitorCount || 0), 1);
                            const pct = Math.max(Math.round(((loc.currentVisitorCount || 0) / maxCount) * 100), loc.crowdLevel === 'RED' ? 75 : loc.crowdLevel === 'YELLOW' ? 45 : 20);
                            return (
                                <div key={loc.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: levelColor, flexShrink: 0, boxShadow: `0 0 6px ${levelColor}88` }}></div>
                                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--admin-text)', width: '120px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.locationName}</span>
                                    <div style={{ flex: 1, height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${levelColor}, ${levelColor}88)`, borderRadius: '6px', transition: 'width 1.2s ease', boxShadow: `0 0 6px ${levelColor}44` }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: levelColor, width: '36px', textAlign: 'right', flexShrink: 0 }}>{loc.currentVisitorCount || 0}</span>
                                </div>
                            );
                        }) : [...Array(3)].map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.3 }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94a3b8', flexShrink: 0 }}></div><span style={{ fontSize: '0.78rem', color: 'var(--admin-text)', width: '120px' }}>Loading...</span><div style={{ flex: 1, height: '10px', background: 'rgba(0,0,0,0.04)', borderRadius: '6px' }}></div></div>)}
                    </div>
                </div>

                <div className="visual-card">
                    <h3 className="visual-title">Hospital Status</h3>
                    <div className="pie-chart-container">
                        <div className="pie-chart" style={{ background: hospitalPie.length > 0 ? `conic-gradient(${hospitalConic})` : 'conic-gradient(#e2e8f0 0% 100%)' }}>
                            <div className="pie-center">
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--admin-text)' }}>{hospitalStats.total}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--admin-text)', opacity: 0.7 }}>CLINICS</span>
                            </div>
                        </div>
                        <div className="pie-legend">
                            {[
                                { label: 'Active', value: hospitalStats.active, color: '#10b981' },
                                { label: 'Full', value: hospitalStats.full, color: '#f59e0b' },
                                { label: 'Closed', value: hospitalStats.closed, color: '#ef4444' },
                                { label: 'Inactive', value: hospitalStats.inactive, color: '#94a3b8' },
                            ].map((seg, i) => (
                                <div key={i} className="legend-item">
                                    <div className="legend-dot" style={{ background: seg.color }}></div>
                                    <div className="legend-info"><span className="legend-label">{seg.label}</span><span className="legend-value">{seg.value}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="visual-card">
                    <h3 className="visual-title">Health & Safety Advisories</h3>
                    <div className="pie-chart-container">
                        <div className="pie-chart" style={{ background: healthTipStats.data.length > 0 ? `conic-gradient(${healthTipConic})` : 'conic-gradient(#e2e8f0 0% 100%)' }}>
                            <div className="pie-center">
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--admin-text)' }}>{healthTipStats.total}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--admin-text)', opacity: 0.7 }}>ACTIVE TIPS</span>
                            </div>
                        </div>
                        <div className="pie-legend">
                            {healthTipStats.data.map((seg, i) => (
                                <div key={i} className="legend-item">
                                    <div className="legend-dot" style={{ background: healthTipPieColors[i % healthTipPieColors.length] }}></div>
                                    <div className="legend-info"><span className="legend-label" style={{ textTransform: 'capitalize' }}>{seg.label.toLowerCase()}</span><span className="legend-value">{seg.value}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="visual-card">
                    <h3 className="visual-title">User Account Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                        <div className="user-status-gauge-row">
                            <div className="user-status-gauge-info">
                                <span className="user-status-gauge-label">Active Accounts</span>
                                <span className="user-status-gauge-count" style={{ color: '#10b981' }}>{userStatusStats.activeCount}</span>
                            </div>
                            <div className="user-status-gauge-track"><div className="user-status-gauge-fill" style={{ width: `${userStatusStats.active}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div></div>
                            <span className="user-status-gauge-pct" style={{ color: '#10b981' }}>{userStatusStats.active}%</span>
                        </div>
                        <div className="user-status-gauge-row">
                            <div className="user-status-gauge-info">
                                <span className="user-status-gauge-label">Inactive Accounts</span>
                                <span className="user-status-gauge-count" style={{ color: '#ef4444' }}>{userStatusStats.inactiveCount}</span>
                            </div>
                            <div className="user-status-gauge-track"><div className="user-status-gauge-fill" style={{ width: `${userStatusStats.inactive}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)' }}></div></div>
                            <span className="user-status-gauge-pct" style={{ color: '#ef4444' }}>{userStatusStats.inactive}%</span>
                        </div>
                        <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--admin-text)', opacity: 0.6, marginBottom: '12px', textTransform: 'uppercase' }}>Role Distribution</div>
                            {[
                                { label: 'Users / Pilgrims', pct: userRoles.pilgrim, color: 'var(--chart-pilgrim)' },
                                { label: 'Operators / Staff', pct: userRoles.staff, color: 'var(--chart-operator)' },
                                { label: 'Admins', pct: userRoles.admin, color: 'var(--chart-admin)' },
                            ].map((role, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text)', width: '120px', flexShrink: 0 }}>{role.label}</span>
                                    <div style={{ flex: 1, height: '7px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${role.pct}%`, height: '100%', background: role.color, borderRadius: '4px' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: role.color, width: '32px', textAlign: 'right' }}>{role.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
