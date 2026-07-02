import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { emergencyService } from '../../api/services/emergencyService';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import OperatorHeader from '../components/OperatorHeader';
import OperatorSidebar from '../components/OperatorSidebar';
import '../../styles/AdminDashboard.css';
import { useWebSocket } from '../../hooks/useWebSocket';

const OperatorLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const operatorUser = {
        name: user?.name || user?.username || "Operator",
        email: user?.email || "operator@kumbh.gov.in",
        role: "Operator"
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
        const fetchNotifications = async () => {
            try {
                const response = await emergencyService.getSosList();
                const data = response.data;
                const list = data.content || (Array.isArray(data) ? data : []);
                const sortedData = [...list].sort((a, b) => b.id - a.id);
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
    }, [clearedNotificationIds]);

    useWebSocket('/topic/sos', () => {
        const fetchNotifications = async () => {
            try {
                const response = await emergencyService.getSosList();
                const data = response.data;
                const list = data.content || (Array.isArray(data) ? data : []);
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
                console.error('SOS fetch failed in operator layout:', err);
            }
        };
        fetchNotifications();
    });

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: "Are you sure you want to end your operator session?",
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
    if (path.includes('/operator/sos')) activeMenu = 'sos';
    else if (path.includes('/operator/live-updates')) activeMenu = 'live-updates';
    else if (path.includes('/operator/live-darshan')) activeMenu = 'live-darshan';

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="admin-layout admin-dashboard-root" data-layout-render="true">
            <OperatorHeader
                unreadCount={unreadCount}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                notifications={notifications}
                clearNotifications={clearAllNotifications}
                setActiveMenu={(menu) => {
                    if (menu === 'sos') navigate('/operator/sos');
                    else navigate('/operator/dashboard');
                }}
                formatTimeAgo={formatTimeAgo}
                setSidebarOpen={setSidebarOpen}
                profile={operatorUser}
                handleLogout={handleLogout}
            />
            
            <div className="admin-body">
                <OperatorSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeMenu={activeMenu}
                    handleLogout={handleLogout}
                    navigate={navigate}
                    profile={operatorUser}
                    unreadCount={unreadCount}
                />
                
                <main className="admin-content">
                    {children}
                </main>

                {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
            </div>
        </div>
    );
};

export default OperatorLayout;
