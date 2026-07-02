import React, { useState, useEffect } from 'react';
import { AlertCircle, Heart, Users, CheckCircle, ShoppingBag, Newspaper, TrendingUp, Package } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import '../../styles/AdminDashboard.css';
import { emergencyService } from '../../api/services/emergencyService';
import { hospitalService } from '../../api/services/hospitalService';
import { liveUpdateService } from '../../api/services/liveUpdateService';
import shopService from '../services/shopService';


// ─── Custom Donut Label ───────────────────────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #f0e8df', borderRadius: 10, padding: '10px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#333' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: '2px 0', color: p.color, fontWeight: 600 }}>
            {p.name}: <span style={{ color: '#333' }}>{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, style = {} }) => (
  <div className="chart-card" style={style}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{title}</h3>
      {subtitle && <span style={{ color: '#aaa', fontSize: 12 }}>{subtitle}</span>}
    </div>
    {children}
  </div>
);


// ═══════════════════════════════════════════════════════════════════════════════
const OperatorDashboard = () => {
  const [activeSos, setActiveSos] = useState("04");
  const [hospitalBeds, setHospitalBeds] = useState("182");
  const [highCrowd, setHighCrowd] = useState("02");
  const [resolved, setResolved] = useState("48");
  const [liveUpdatesCount, setLiveUpdatesCount] = useState("0");
  const [totalOrders, setTotalOrders] = useState("0");
  const [recentIncidents, setRecentIncidents] = useState([]);

  // Chart data states
  const [sosChartData, setSosChartData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [sosTypeData, setSosTypeData] = useState([]);

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sosRes, liveUpdateRes, ordersRes, hospitalRes, allOrdersRes] = await Promise.all([
          emergencyService.getSosList().catch(() => ({ data: [] })),
          liveUpdateService.getAllUpdates().catch(() => ({ data: [] })),
          shopService.getAllOrdersOperator({ page: 0, size: 1 }).catch(() => ({ data: { totalElements: 0 } })),
          hospitalService.getAllHospitals(0, 100).catch(() => ({ data: { content: [] } })),
          shopService.getAllOrdersOperator({ page: 0, size: 500 }).catch(() => ({ data: { content: [] } })),
        ]);

        // ── SOS processing ────────────────────────────────────────────────────
        const sosList = Array.isArray(sosRes.data) ? sosRes.data : (sosRes.data?.content || []);
        const activeCount = sosList.filter(s => ['pending', 'accepted'].includes(s.status?.toLowerCase())).length;
        const resolvedCount = sosList.filter(s => s.status?.toLowerCase() === 'resolved').length;

        // SOS 6-hour chart
        const now = new Date();
        const hourlyData = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 60 * 60 * 1000);
          hourlyData[d.getHours() + ':00'] = 0;
        }
        sosList.forEach(sos => {
          const sosTime = new Date(sos.reportedTime || sos.createdAt || Date.now());
          const diffHours = (now - sosTime) / (1000 * 60 * 60);
          if (diffHours <= 6 && diffHours >= 0) {
            const key = sosTime.getHours() + ':00';
            if (hourlyData[key] !== undefined) hourlyData[key]++;
          }
        });
        setSosChartData(Object.keys(hourlyData).map(time => ({ time, alerts: hourlyData[time] })));

        // SOS by type chart
        const typeCounts = {};
        sosList.forEach(s => {
          const t = s.emergencyType || 'Other';
          typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        const typeArr = Object.entries(typeCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setSosTypeData(typeArr.length ? typeArr : [
          { name: 'Medical', count: 3 }, { name: 'Fire', count: 1 },
          { name: 'Missing', count: 2 }, { name: 'Crowd', count: 1 }
        ]);

        // Recent incidents
        const sortedIncidents = [...sosList]
          .sort((a, b) => new Date(b.reportedTime || b.createdAt || 0) - new Date(a.reportedTime || a.createdAt || 0))
          .slice(0, 3);
        setRecentIncidents(sortedIncidents);

        // ── Hospital processing ───────────────────────────────────────────────
        const hospitalList = hospitalRes.data?.content || [];
        const totalBeds = hospitalList
          .filter(h => ['active', 'full'].includes(h.status?.toLowerCase()))
          .reduce((acc, curr) => acc + (parseInt(curr.beds) || 0), 0);

        // ── Orders processing ─────────────────────────────────────────────────
        const liveUpdatesList = Array.isArray(liveUpdateRes.data) ? liveUpdateRes.data : [];
        const liveCount = liveUpdatesList.filter(u => !u.category || u.category === 'LIVE_UPDATE').length;

        const allOrdersList = allOrdersRes.data?.content || [];
        const pendingOrders = allOrdersList.filter(o => ['pending', 'placed'].includes(o.status?.toLowerCase())).length;
        const deliveredOrders = allOrdersList.filter(o => o.status?.toLowerCase() === 'delivered').length;
        const cancelledOrders = allOrdersList.filter(o => ['cancelled', 'canceled'].includes(o.status?.toLowerCase())).length;
        const processingOrders = allOrdersList.filter(o => ['processing', 'shipped'].includes(o.status?.toLowerCase())).length;

        const totalOrderCount = pendingOrders + deliveredOrders + cancelledOrders + processingOrders;
        // Use fallback demo data if all real counts are 0 (no orders yet)
        setOrderStatusData(totalOrderCount > 0 ? [
          { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
          { name: 'Processing', value: processingOrders, color: '#3b82f6' },
          { name: 'Delivered', value: deliveredOrders, color: '#10b981' },
          { name: 'Cancelled', value: cancelledOrders, color: '#ef4444' },
        ] : [
          { name: 'Pending', value: 4, color: '#f59e0b' },
          { name: 'Processing', value: 3, color: '#3b82f6' },
          { name: 'Delivered', value: 12, color: '#10b981' },
          { name: 'Cancelled', value: 2, color: '#ef4444' },
        ]);

        // ── Set state ─────────────────────────────────────────────────────────
        setActiveSos(activeCount < 10 ? `0${activeCount}` : activeCount.toString());
        setResolved(resolvedCount < 10 ? `0${resolvedCount}` : resolvedCount.toString());
        setHospitalBeds(totalBeds.toString());
        setHighCrowd("02");
        setLiveUpdatesCount(liveCount.toString());
        setTotalOrders(ordersRes.data?.totalElements?.toString() || "0");

      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const PIE_COLORS = orderStatusData.map(d => d.color);

  return (
    <div className="op-dashboard-container">
      <style>{`
        .op-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 28px;
        }
        .op-charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .op-charts-row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .op-charts-row3 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .stat-card {
          min-width: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255,126,54,0.1) !important;
          background: white !important;
          padding: 22px !important;
          border-radius: 22px !important;
          box-shadow: 0 8px 24px rgba(74,42,24,0.04) !important;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(255,126,54,0.12) !important;
          border-color: rgba(255,126,54,0.3) !important;
        }
        .card-sparkline {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 40px;
          opacity: 0.18;
          pointer-events: none;
        }
        .card-sparkline svg { width: 100%; height: 100%; display: block; }
        .stat-card:hover .card-sparkline { opacity: 0.38; transition: opacity 0.3s; }
        
        .incidents-section {
          padding: 22px 24px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(74,42,24,0.06);
          border: 1px solid rgba(255,126,54,0.08);
          display: flex;
          flex-direction: column;
        }
        .summary-cards-centered {
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: center !important;
          gap: 20px !important;
          margin-bottom: 32px !important;
        }
        .summary-cards-centered .stat-card {
          flex: 0 1 calc(25% - 24px) !important;
          max-width: calc(25% - 10px) !important;
          min-width: 280px !important;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .chart-card {
          background: #fff;
          border-radius: 20px;
          padding: 22px 24px;
          box-shadow: 0 4px 20px rgba(74,42,24,0.06);
          border: 1px solid rgba(255,126,54,0.08);
        }
        .orders-donut-wrapper {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .orders-donut-chart-container {
          flex: 0 0 180px;
          height: 200px;
        }
        .orders-donut-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .op-header {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .op-dashboard-container {
          padding: 24px;
          background-color: #fcf3e6;
          min-height: 100%;
          font-family: var(--font-dashboard-body);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .op-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .op-charts-row, .op-charts-row2, .op-charts-row3 {
            grid-template-columns: 1fr;
          }
          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .op-stats-grid {
            grid-template-columns: 1fr;
          }
          .summary-cards {
            grid-template-columns: 1fr;
          }
          .op-dashboard-container {
            padding: 16px;
          }
          .admin-card {
            background: white;
            padding: 24px;
            border-radius: 20px;
            border: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            position: relative;
            overflow: hidden;
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 12px;
          }
          .stat-value {
            font-size: 32px;
            font-weight: 800;
            color: #111;
            margin-bottom: 4px;
          }
          .stat-label {
            color: #666;
            font-size: 14px;
            font-weight: 500;
          }
          .status-pill {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
        }

        @media (max-width: 576px) {
          .chart-card {
            padding: 16px 12px;
            border-radius: 16px;
          }
          .incidents-section {
            padding: 16px 12px;
            border-radius: 16px;
          }
          .orders-donut-wrapper {
            flex-direction: column;
            gap: 16px;
          }
          .orders-donut-chart-container {
            flex: 0 0 200px;
            width: 200px;
            height: 200px;
            margin: 0 auto;
          }
          .orders-donut-legend {
            width: 100%;
          }
          .op-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .op-dashboard-container {
            padding: 12px;
          }
        }
      `}</style>

      <div className="op-header">
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#1a1a1a' }}>Operator Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Real-time operational overview</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '8px 16px', fontSize: 13, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0e8df' }}>
          🕐 Live · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="summary-cards grid-3">

        {/* 1. Active SOS */}
        <div className="stat-card" onClick={() => window.location.href = '/operator/sos'} style={{ '--card-accent': '#ef4444' }}>
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', position: 'relative' }}>
              <div className={parseInt(activeSos) > 0 ? 'sos-blink' : ''} style={{ display: 'flex' }}>
                <AlertCircle size={24} />
              </div>
              {parseInt(activeSos) > 0 && <div className="sos-indicator-dot"></div>}
            </div>
            <span className={`status-pill status-pending ${parseInt(activeSos) > 0 ? 'sos-blink' : ''}`} style={{ fontSize: '0.65rem' }}>
              {parseInt(activeSos) > 0 ? `${activeSos} Active` : 'All Clear'}
            </span>
          </div>
          <div className="stat-title">Active SOS Requests</div>
          <div className="stat-value">{activeSos}</div>
          <div className="stat-progress"><div className="progress-bar" style={{ width: '65%', background: '#ef4444' }}></div></div>
          <div className="stat-footer">Critical response active</div>
        </div>

        {/* 2. Hospital Beds */}
        <div className="stat-card" onClick={() => window.location.href = '/operator/hospitals'} style={{ '--card-accent': '#10b981' }}>
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Heart size={24} /></div>
            <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>Live</span>
          </div>
          <div className="stat-title">Available Hospital Beds</div>
          <div className="stat-value">{hospitalBeds}</div>
          <div className="stat-progress"><div className="progress-bar" style={{ width: '85%', background: '#10b981' }}></div></div>
          <div className="stat-footer">Across sector hospitals</div>
        </div>

        {/* 3. High Crowd Zones */}
        <div className="stat-card" onClick={() => window.location.href = '/crowd-status'} style={{ '--card-accent': '#ff7e36' }}>
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: 'rgba(255,126,54,0.1)', color: '#ff7e36' }}><Users size={24} /></div>
            <span className="status-pill status-pending" style={{ fontSize: '0.65rem' }}>↑ 5%</span>
          </div>
          <div className="stat-title">High Crowd Zones</div>
          <div className="stat-value">{highCrowd}</div>
          <div className="stat-progress"><div className="progress-bar" style={{ width: '40%', background: '#ff7e36' }}></div></div>
          <div className="stat-footer">Monitoring Sector Alpha</div>
        </div>

        {/* 4. Total Orders */}
        <div className="stat-card" onClick={() => window.location.href = '/operator/orders'} style={{ '--card-accent': '#3b82f6' }}>
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><ShoppingBag size={24} /></div>
            <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>Live DB</span>
          </div>
          <div className="stat-title">Total Shop Orders</div>
          <div className="stat-value">{totalOrders}</div>
          <div className="stat-progress"><div className="progress-bar" style={{ width: '100%', background: '#3b82f6' }}></div></div>
          <div className="stat-footer">Real-time fulfillment hub</div>
        </div>

        {/* 5. Resolved Cases */}
        <div className="stat-card" onClick={() => window.location.href = '/operator/sos'} style={{ '--card-accent': '#8b5cf6' }}>
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}><CheckCircle size={24} /></div>
            <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>92%</span>
          </div>
          <div className="stat-title">Resolved Cases</div>
          <div className="stat-value">{resolved}</div>
          <div className="stat-progress"><div className="progress-bar" style={{ width: '92%', background: '#8b5cf6' }}></div></div>
          <div className="stat-footer">High efficiency rating</div>
        </div>

        {/* 6. Broadcast Updates */}
        <div className="stat-card" onClick={() => window.location.href = '/operator/live-updates'} style={{ '--card-accent': '#ea580c' }}>
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: 'rgba(234,88,12,0.1)', color: '#ea580c' }}><Newspaper size={24} /></div>
            <span className="status-pill status-accepted" style={{ fontSize: '0.65rem' }}>Active</span>
          </div>
          <div className="stat-title">Broadcast Updates</div>
          <div className="stat-value">{liveUpdatesCount}</div>
          <div className="stat-progress"><div className="progress-bar" style={{ width: '100%', background: '#ea580c' }}></div></div>
          <div className="stat-footer">Real-time feed active</div>
        </div>

      </div>

      {/* ── Row 1: SOS Trend + Recent Incidents ─────────────────────────────── */}
      <div className="op-charts-row">
        <ChartCard title="🚨 SOS Alerts Trend" subtitle="Last 6 Hours">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sosChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="alerts" name="SOS Alerts" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#sosGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Recent Incidents */}
        <div className="incidents-section">
          <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Recent Incidents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {recentIncidents.length > 0 ? recentIncidents.map((incident, idx) => {
              const isResolved = incident.status?.toLowerCase() === 'resolved';
              const isPending = incident.status?.toLowerCase() === 'pending';
              const color = isResolved ? '#16a34a' : (isPending ? '#f59e0b' : '#ef4444');
              return (
                <div key={incident.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 4, height: 36, backgroundColor: color, borderRadius: 2 }}></div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#333', fontSize: 14, textTransform: 'capitalize' }}>{incident.emergencyType || 'Emergency Alert'}</div>
                      <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                        {getTimeAgo(incident.reportedTime || incident.createdAt)} · {incident.location || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <span style={{ background: '#f5f5f5', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'capitalize' }}>
                    {incident.status || 'Unknown'}
                  </span>
                </div>
              );
            }) : (
              <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No recent incidents</div>
            )}
          </div>
          <button
            onClick={() => window.location.href = '/operator/sos'}
            style={{ marginTop: 16, padding: '10px 20px', borderRadius: 20, border: '1px solid #111', background: 'transparent', color: '#111', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            View All Activity →
          </button>
        </div>
      </div>

      {/* ── Row 2: Orders Donut + SOS by Type – side by side ───────────────── */}
      <div className="op-charts-row2">

        {/* Orders by Status – Donut */}
        <ChartCard title="📦 Orders by Status" subtitle="Current snapshot">
          <div className="orders-donut-wrapper">
            <div className="orders-donut-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="orders-donut-legend">
              {orderStatusData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0 }}></div>
                    <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#222' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* SOS by Type – Horizontal Bar */}
        <ChartCard title="🔥 SOS by Emergency Type" subtitle="All time">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sosTypeData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#555' }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Incidents" radius={[0, 6, 6, 0]}>
                  {sosTypeData.map((_, i) => (
                    <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'][i % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

      </div>

    </div>
  );
};

export default OperatorDashboard;