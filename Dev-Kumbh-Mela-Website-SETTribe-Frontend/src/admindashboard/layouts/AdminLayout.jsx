import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { emergencyService } from '../../api/services/emergencyService';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import '../../styles/AdminDashboard.css';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';

const AdminLayout = ({ children }) => {
    const { settings } = useAdminSettings();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const adminUser = {
        name: user?.name || user?.username || "Shri. Mahant",
        email: user?.email || "admin@kumbh.gov.in",
        role: (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin") + 
              (user?.role?.toLowerCase() === 'admin' ? "istrator" : " Access")
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Just now';
        try {
            const reported = new Date(dateStr);
            const diffInMins = Math.floor((new Date() - reported) / 60000);
            if (diffInMins < 1) return 'Just now';
            if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? 'min' : 'mins'} ago`;
            const diffInHours = Math.floor(diffInMins / 60);
            if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
            return reported.toLocaleDateString();
        } catch (e) { return 'Just now'; }
    };

    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [clearedNotificationIds, setClearedNotificationIds] = useState(() => JSON.parse(localStorage.getItem(`clearedNotifIds_${user?.id}`) || '[]'));

    const clearAllNotifications = () => {
        const currentIds = notifications.map(n => n.id);
        const newClearedIds = [...new Set([...clearedNotificationIds, ...currentIds])];
        localStorage.setItem(`clearedNotifIds_${user?.id}`, JSON.stringify(newClearedIds));
        setClearedNotificationIds(newClearedIds);
        setNotifications([]);
        setUnreadCount(0);
    };

    useEffect(() => {
        if (!settings?.systemNotifications) {
            setUnreadCount(0);
            setNotifications([]);
            return;
        }
        const fetchNotifications = async () => {
            try {
                const response = await emergencyService.getSosList();
                const data = response.data;
                const list = data.content || (Array.isArray(data) ? data : []);
                const sortedData = [...list].sort((a, b) => b.id - a.id);
                // Filter out cleared notifications
                const pendingAlerts = sortedData.filter(a => (a.status || '').toLowerCase() === 'pending' && !clearedNotificationIds.includes(a.id));
                
                const newNotifications = pendingAlerts.map(alert => ({
                    id: alert.id,
                    text: `${alert.priority || 'Urgent'} SOS: ${alert.emergencyType || 'Multiple Issues'}`,
                    reportedTime: alert.reportedTime || new Date().toISOString(),
                    status: alert.status
                }));
                setNotifications(newNotifications);
                setUnreadCount(newNotifications.length);
            } catch (err) { console.error(err); }
        };

        fetchNotifications();
    }, [settings?.systemNotifications, clearedNotificationIds]);

    useWebSocket('/topic/sos', () => {
        if (!settings?.systemNotifications) return;
        const fetchNotifications = async () => {
            try {
                const response = await emergencyService.getSosList();
                const data = response.data;
                const list = data.content || (Array.isArray(data) ? data : []);
                // Filter out cleared notifications
                const pendingAlerts = [...list]
                    .filter((alert) => (alert.status || '').toLowerCase() === 'pending' && !clearedNotificationIds.includes(alert.id))
                    .sort((a, b) => b.id - a.id);

                setNotifications(pendingAlerts.map((alert) => ({
                    id: alert.id,
                    text: `${alert.priority || 'Urgent'} SOS: ${alert.emergencyType || 'Multiple Issues'}`,
                    reportedTime: alert.reportedTime || alert.createdAt || new Date().toISOString(),
                    status: alert.status
                })));
                setUnreadCount(pendingAlerts.length);
            } catch (err) {
                console.error('SOS fetch failed in admin layout:', err);
            }
        };
        fetchNotifications();
    });

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: "Are you sure you want to end your administrative session?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff7e36',
            confirmButtonText: 'Yes, LOGOUT',
            background: '#ffffff',
            borderRadius: '20px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await logout();
                navigate('/');
            }
        });
    };

    const path = location.pathname;
    let activeMenu = 'dashboard';
    if (path.includes('/admin-dashboard/users')) activeMenu = 'users';
    else if (path.includes('/admin-dashboard/viewers')) activeMenu = 'viewers';
    else if (path.includes('/admin-dashboard/sos')) activeMenu = 'sos';
    else if (path.includes('/admin-dashboard/hospitals')) activeMenu = 'hospitals';
    else if (path.includes('/admin-dashboard/safety-resources')) activeMenu = 'safety-resources';
    else if (path.includes('/admin-dashboard/settings')) activeMenu = 'settings';
    else if (path.includes('/admin-dashboard/helplines')) activeMenu = 'helplines';
    else if (path.includes('/admin-dashboard/donation-config')) activeMenu = 'donation-config';
    else if (path.includes('/admin-dashboard/donations-data')) activeMenu = 'donations-data';
    else if (path.includes('/admin-dashboard/crowd')) activeMenu = 'crowd';
    else if (path.includes('/admin-dashboard/weather')) activeMenu = 'weather';

    // Auto-close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="admin-layout admin-dashboard-root" data-layout-render="true">
            {/* Debug marker - only visible if nothing else renders */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0.01 }}>Admin Layout Active</div>
            
            <AdminHeader
                unreadCount={unreadCount}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                notifications={notifications}
                clearNotifications={clearAllNotifications}
                setActiveMenu={(menu) => {
                    if (menu === 'sos') navigate('/admin-dashboard/sos');
                    else navigate('/admin-dashboard');
                }}
                formatTimeAgo={formatTimeAgo}
                handleLogout={handleLogout}
                profile={adminUser}
                setSidebarOpen={setSidebarOpen}
                systemNotifications={settings?.systemNotifications}
                maintenanceMode={settings?.maintenanceMode}
            />
            
            <div className="admin-body">
                <AdminSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeMenu={activeMenu}
                    handleLogout={handleLogout}
                    navigate={navigate}
                    profile={adminUser}
                    unreadCount={unreadCount}
                />
                
                <main className="admin-content">
                    {children}
                </main>

                {/* Mobile overlay moved here to ensure stacking order */}
                {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
            </div>
        </div>
    );
};

export default AdminLayout;
