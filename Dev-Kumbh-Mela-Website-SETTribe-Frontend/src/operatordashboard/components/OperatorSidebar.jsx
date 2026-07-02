import React, { useState, useEffect } from 'react'; // React Imports
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../api/services/activityService';
import { emergencyService } from '../../api/services/emergencyService';
import { poojaBookingService } from '../../api/services/poojaBookingService';
import {
    CloseIcon,
    DashboardIcon,
    HospitalIcon,
    SosIcon,
    LogoutIcon,
    CalendarIcon,
    UsersIcon,
    OrdersIcon,
    DonationSettingsIcon,
    HelplineIcon,
    HealthSafetyIcon,
    TrishulIcon,
    HeritageIcon,
    MenuIcon,
    HistoryIcon,
    HighlightsIcon,
    SaintsIcon,
    PlacesIcon,
    InfoIcon,
    ToolsIcon,
    PackageIcon,
    MapPinIcon,
    TruckIcon
} from './OperatorIcons';

const LiveUpdatesIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const StayIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const ViewMapIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const OperatorSidebar = ({
    sidebarOpen,
    setSidebarOpen,
    activeMenu,
    navigate,
    profile,
    unreadCount = 0
}) => {
    const [expandedMenus, setExpandedMenus] = useState(() => {
        const initial = [];
        if (['live-darshan', 'pooja-schedule', 'acharyas', 'pooja-bookings'].includes(activeMenu)) initial.push('virtual-pooja');
        if (['live-updates'].includes(activeMenu)) initial.push('live-kumbh');
        if (['heritage-history', 'heritage-highlights', 'heritage-saints', 'heritage-places'].includes(activeMenu)) initial.push('heritage');
        if (['hospitals', 'sos', 'helplines', 'safety-resources'].includes(activeMenu)) initial.push('health-safety');
        if (['shop-products', 'shop-artisans', 'shop-track', 'shop-deliver', 'shop-orders', 'shop-product-queue'].includes(activeMenu)) initial.push('shop');
        return initial;
    });

    const [pendingPoojaCount, setPendingPoojaCount] = useState(0);

    const [overviewData, setOverviewData] = useState({
        activeUsers24h: '...',
        newRegistrations24h: '...',
        pendingSOS: '...'
    });

    useEffect(() => {
        const fetchOperatorOverview = async () => {
            try {
                const [overviewRes, sosRes, bookingsRes] = await Promise.all([
                    activityService.getTodayOverview(),
                    emergencyService.getSosList(0, 100),
                    poojaBookingService.getAllBookings('', 0, 100)
                ]);

                const overview = overviewRes.data;
                const sosList = sosRes.data.content || sosRes.data || [];
                const pendingCount = sosList.filter(s => (s.status || '').toLowerCase() === 'pending').length;
                const bookingsList = bookingsRes.data?.content || bookingsRes.data || [];
                const pendingBookingsCount = bookingsList.filter(b => (b.status || '').toUpperCase() === 'PENDING').length;

                setOverviewData({
                    activeUsers24h: overview.activeUsers24h?.toLocaleString() || '0',
                    newRegistrations24h: `+${overview.newRegistrations24h || 0}`,
                    pendingSOS: pendingCount
                });
                setPendingPoojaCount(pendingBookingsCount);
            } catch (error) {
                console.warn("Failed to fetch operator overview:", error);
                setOverviewData({
                    activeUsers24h: '842',
                    newRegistrations24h: '+56',
                    pendingSOS: '12'
                });
                setPendingPoojaCount(0);
            }
        };

        fetchOperatorOverview();
        const interval = setInterval(fetchOperatorOverview, 10000); // 10s interval
        return () => clearInterval(interval);
    }, []);

    const toggleMenu = (menu) => {
        setExpandedMenus(prev =>
            prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
        );
    };


    const localNavigate = (p) => {
        if (navigate) {
            navigate(p);
        } else {
            window.location.href = p;
        }
        if (window.innerWidth <= 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <aside className={`operator-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {/* Extremely prominent Close Button for Mobile */}
            <button
                className="sidebar-close-btn-alt"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close Sidebar"
            >
                <CloseIcon />
            </button>

            <nav className="sidebar-nav">
                <div
                    className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                    onClick={() => localNavigate('/operator/dashboard')}
                >
                    <DashboardIcon /> Dashboard
                </div>

                {/* Live Kumbh Updates Dropdown */}
                <div
                    className="nav-item has-dropdown"
                    onClick={() => toggleMenu('live-kumbh')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LiveUpdatesIcon /> Live Kumbh Update
                    </div>
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s', transform: expandedMenus.includes('live-kumbh') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expandedMenus.includes('live-kumbh') && (
                    <div className="sidebar-dropdown-menu" style={{ backgroundColor: 'rgba(0,0,0,0)', paddingLeft: '40px', paddingBottom: '10px' }}>
                        <div className={`nav-item sub-item ${activeMenu === 'live-updates' ? 'active' : ''}`} onClick={() => localNavigate('/operator/live-updates')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <InfoIcon /> Live Updates
                            </div>
                        </div>
                        {/* <div className={`nav-item sub-item ${activeMenu === 'essential-services' ? 'active' : ''}`} onClick={() => localNavigate('/operator/essential-services')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ToolsIcon /> Essential Services
                            </div>
                        </div> */}
                    </div>
                )}

                <div className={`nav-item ${activeMenu === 'travel-stay' ? 'active' : ''}`} onClick={() => localNavigate('/operator/travel-stay')}>
                    <StayIcon /> Travel & Stay
                </div>

                {/* Virtual Pooja Dropdown */}
                <div
                    className="nav-item has-dropdown"
                    onClick={() => toggleMenu('virtual-pooja')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative', display: 'flex' }}>
                            <TrishulIcon />
                            {pendingPoojaCount > 0 && <div className="sos-indicator-dot" style={{ top: '-2px', right: '-2px', width: '8px', height: '8px' }}></div>}
                        </div>
                        <span className={pendingPoojaCount > 0 ? 'sos-blink' : ''}>Virtual Pooja</span>
                    </div>
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s', transform: expandedMenus.includes('virtual-pooja') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expandedMenus.includes('virtual-pooja') && (
                    <div className="sidebar-dropdown-menu" style={{ backgroundColor: 'rgba(0,0,0,0)', paddingLeft: '40px', paddingBottom: '10px' }}>
                        <div className={`nav-item sub-item ${activeMenu === 'live-darshan' ? 'active' : ''}`} onClick={() => localNavigate('/operator/live-darshan')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <LiveUpdatesIcon /> Live Darshan
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'pooja-schedule' ? 'active' : ''}`} onClick={() => localNavigate('/operator/pooja-schedule')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CalendarIcon /> Pooja Schedule
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'acharyas' ? 'active' : ''}`} onClick={() => localNavigate('/operator/acharyas')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <UsersIcon /> Manage Acharyas
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'pooja-bookings' ? 'active' : ''}`} onClick={() => localNavigate('/operator/pooja-bookings')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ position: 'relative', display: 'flex' }}>
                                    <OrdersIcon />
                                    {pendingPoojaCount > 0 && <div className="sos-indicator-dot" style={{ top: '-2px', right: '-2px', width: '8px', height: '8px' }}></div>}
                                </div>
                                <span className={pendingPoojaCount > 0 ? 'sos-blink' : ''}>Pooja Bookings</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Health & Safety Dropdown */}
                <div
                    className="nav-item has-dropdown"
                    onClick={() => toggleMenu('health-safety')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative', display: 'flex' }}>
                            <HealthSafetyIcon />
                            {unreadCount > 0 && <div className="sos-indicator-dot" style={{ top: '-2px', right: '-2px', width: '8px', height: '8px' }}></div>}
                        </div>
                        <span className={unreadCount > 0 ? 'sos-blink' : ''}>Health & Safety</span>
                    </div>
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s', transform: expandedMenus.includes('health-safety') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expandedMenus.includes('health-safety') && (
                    <div className="sidebar-dropdown-menu" style={{ backgroundColor: 'rgba(0,0,0,0)', paddingLeft: '40px', paddingBottom: '10px' }}>
                        <div className={`nav-item sub-item ${activeMenu === 'helplines' ? 'active' : ''}`} onClick={() => localNavigate('/operator/helplines')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HelplineIcon /> Helplines
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'sos' ? 'active' : ''}`} onClick={() => localNavigate('/operator/sos')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ position: 'relative', display: 'flex' }}>
                                    <SosIcon />
                                    {unreadCount > 0 && <div className="sos-indicator-dot" style={{ top: '-2px', right: '-2px', width: '8px', height: '8px' }}></div>}
                                </div>
                                <span className={unreadCount > 0 ? 'sos-blink' : ''}>SOS Alerts</span>
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'hospitals' ? 'active' : ''}`} onClick={() => localNavigate('/operator/hospitals')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HospitalIcon /> Hospitals & Safety
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'safety-resources' ? 'active' : ''}`} onClick={() => localNavigate('/operator/safety-resources')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPinIcon /> Safety Resources
                            </div>
                        </div>
                    </div>
                )}

                {/* Nashik Heritage Dropdown */}
                <div
                    className="nav-item has-dropdown"
                    onClick={() => toggleMenu('heritage')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HeritageIcon /> Nashik Heritage
                    </div>
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s', transform: expandedMenus.includes('heritage') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expandedMenus.includes('heritage') && (
                    <div className="sidebar-dropdown-menu" style={{ backgroundColor: 'rgba(0,0,0,0)', paddingLeft: '40px', paddingBottom: '10px' }}>
                        <div className={`nav-item sub-item ${activeMenu === 'heritage-history' ? 'active' : ''}`} onClick={() => localNavigate('/operator/heritage-history')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HistoryIcon /> Kumbh History
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'heritage-highlights' ? 'active' : ''}`} onClick={() => localNavigate('/operator/heritage-highlights')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HighlightsIcon /> Past Highlights
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'heritage-saints' ? 'active' : ''}`} onClick={() => localNavigate('/operator/heritage-saints')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <SaintsIcon /> Saints & Akhadas
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'heritage-places' ? 'active' : ''}`} onClick={() => localNavigate('/operator/heritage-places')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <PlacesIcon /> Spiritual Places
                            </div>
                        </div>
                    </div>
                )}

                {/* Shop Management Dropdown */}
                <div
                    className="nav-item has-dropdown"
                    onClick={() => toggleMenu('shop')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <OrdersIcon /> Shop
                    </div>
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s', transform: expandedMenus.includes('shop') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expandedMenus.includes('shop') && (
                    <div className="sidebar-dropdown-menu" style={{ backgroundColor: 'rgba(0,0,0,0)', paddingLeft: '40px', paddingBottom: '10px' }}>
                        <div className={`nav-item sub-item ${activeMenu === 'shop-products' ? 'active' : ''}`} onClick={() => localNavigate('/operator/shop/products')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <PackageIcon /> Products
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'shop-artisans' ? 'active' : ''}`} onClick={() => localNavigate('/operator/shop/artisans')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <UsersIcon /> Artisans
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'shop-track' ? 'active' : ''}`} onClick={() => localNavigate('/operator/shop/track')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPinIcon /> Track Product
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'shop-deliver' ? 'active' : ''}`} onClick={() => localNavigate('/operator/shop/deliver')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TruckIcon /> Deliver Product
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'shop-product-queue' ? 'active' : ''}`} onClick={() => localNavigate('/operator/shop/product-queue')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HistoryIcon /> Product Requests
                            </div>
                        </div>
                        <div className={`nav-item sub-item ${activeMenu === 'shop-orders' ? 'active' : ''}`} onClick={() => localNavigate('/operator/shop/orders')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <OrdersIcon /> All Orders
                            </div>
                        </div>
                    </div>
                )}

                <div className={`nav-item ${activeMenu === 'donation-config' ? 'active' : ''}`} onClick={() => localNavigate('/operator/donation-config')}>
                    <DonationSettingsIcon /> Donations
                </div>
            </nav>

            {/* Operator Today Overview Widget */}
            <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,126,54,0.1) 0%, rgba(255,126,54,0.02) 100%)',
                    border: '1px solid rgba(255,126,54,0.15)',
                    padding: '16px',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <h4 style={{ color: 'var(--admin-accent-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--admin-accent)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px var(--admin-accent)' }}></span>
                        Operator Overview
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--admin-sidebar-text)', opacity: 0.8, fontWeight: '500' }}>Live Visitors</span>
                            <span style={{ fontSize: '0.9rem', color: '#2e7d32', fontWeight: '700' }}>{overviewData.activeUsers24h}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--admin-sidebar-text)', opacity: 0.8, fontWeight: '500' }}>Active SOS Alerts</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {parseInt(overviewData.pendingSOS) > 0 && <div className="sos-indicator-dot" style={{ position: 'static', width: '8px', height: '8px' }}></div>}
                                <span className={parseInt(overviewData.pendingSOS) > 0 ? 'sos-blink' : ''} style={{ fontSize: '0.9rem', color: '#c62828', fontWeight: '700' }}>{overviewData.pendingSOS}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--admin-sidebar-text)', opacity: 0.8, fontWeight: '500' }}>New Users</span>
                            <span style={{ fontSize: '0.9rem', color: '#2e7d32', fontWeight: '700' }}>{overviewData.newRegistrations24h}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default OperatorSidebar;
