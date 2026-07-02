import React from 'react';
import { LogoutIcon, MenuIcon } from './AdminIcons';

// Inlined Icons to prevent 'undefined' component runtime errors
const TrishulIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M12 6c3.5 0 6 2.5 6 6M12 6c-3.5 0-6 2.5-6 6M6 12h12" />
        <path d="M12 2l-2 3h4l-2-3z" />
    </svg>
);

const BellIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const SearchIcon = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const AdminHeader = ({ 
    unreadCount, 
    showNotifications, 
    setShowNotifications, 
    notifications = [], 
    clearNotifications,
    setActiveMenu,
    formatTimeAgo,
    handleLogout,
    profile,
    setSidebarOpen,
    systemNotifications = true,
    maintenanceMode = false
}) => {
    return (
        <header className="admin-navbar">
            <div className="navbar-left">
                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-btn" onClick={() => (setSidebarOpen && setSidebarOpen(true))} aria-label="Open Menu">
                    <MenuIcon />
                </button>

                {/* Enhanced Trishul Integrated Logo */}
                <div className="admin-integrated-logo" onClick={() => setActiveMenu('dashboard')}>
                    <div className="logo-icon-wrapper">
                        <TrishulIcon />
                    </div>
                    <div className="logo-text-wrapper">
                        <span className="logo-main">MAHA KUMBH</span>
                        <span className="logo-sub">ADMINISTRATION</span>
                    </div>
                </div>
            </div>

            <div className="navbar-spacer" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {maintenanceMode && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#d32f2f', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(211, 47, 47, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ⚠️ SYSTEM IN MAINTENANCE MODE
                    </div>
                )}
            </div>

            <div className="navbar-actions">
                {systemNotifications && (
                    <div className="notification-container">
                        <button 
                            className={`action-btn ${unreadCount > 0 ? 'has-notif sos-blink' : ''}`} 
                            onClick={() => setShowNotifications(!showNotifications)}
                            aria-label="Notifications"
                            style={{ position: 'relative' }}
                        >
                            <BellIcon />
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            {unreadCount > 0 && <div className="sos-indicator-dot" style={{ top: 'auto', bottom: '-2px', right: '-2px' }}></div>}
                        </button>
                        
                        {showNotifications && (
                            <div className="notification-dropdown-fixed">
                                <div className="dropdown-header-alt">
                                    <h3>Real-time Alerts</h3>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button className="clear-btn-alt" onClick={clearNotifications}>Clear All</button>
                                        <button className="notif-close-btn" onClick={() => setShowNotifications(false)} aria-label="Close">✕</button>
                                    </div>
                                </div>
                                <div className="notification-scrollbar">
                                    {(!notifications || notifications.length === 0) ? (
                                        <div className="empty-notif" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>
                                            
                                            <p style={{ fontSize: '0.85rem' }}>All caught up!</p>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="notification-item-modern" onClick={() => { setActiveMenu('sos'); setShowNotifications(false); }}>
                                                <div className="notif-dot-active"></div>
                                                <div className="notif-content-modern">
                                                    <p>{notif.text}</p>
                                                    <span>{formatTimeAgo(notif.reportedTime)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {profile && (
                    <div className="header-profile-section" style={{ display: 'flex', alignItems: 'center', margin: '0 15px', padding: '4px 10px', borderRadius: '30px', background: 'rgba(255, 126, 54, 0.08)', border: '1px solid rgba(255, 126, 54, 0.15)' }}>
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=4a2a18&color=fff&bold=true&rounded=true`}
                            alt="Admin"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#4a372d' }}>{profile.name}</span>
                            <span style={{ fontSize: '9px', color: '#e65100', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{profile.role}</span>
                        </div>
                    </div>
                )}

                <button 
                    className="action-btn logout-header-btn" 
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogoutIcon />
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
