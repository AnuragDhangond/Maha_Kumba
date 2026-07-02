import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import {
  Cloud, AlertTriangle, Send, Trash2, CheckCircle,
  Plus, Clock, Wind, Droplets, Thermometer,
  ShieldAlert, Megaphone, History, RefreshCcw
} from 'lucide-react';
import { fetchRealWeather } from '../../api/weatherApi';
import '../../styles/DashboardForms.css'; // Importing standard dashboard styles

const WeatherManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTimeWeather, setRealTimeWeather] = useState(null);

  // Form states
  const [newAlert, setNewAlert] = useState({ type: '', message: '', severity: 'Medium' });
  const [newNotification, setNewNotification] = useState({ title: '', content: '', type: 'Manual' });
  const [alertValidated, setAlertValidated] = useState(false);
  const [notificationValidated, setNotificationValidated] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchRealTimeData, 300000); // Update real weather every 5 mins
    return () => clearInterval(interval);
  }, []);

  const fetchRealTimeData = async () => {
    try {
      const data = await fetchRealWeather();
      setRealTimeWeather(data);
    } catch (error) {
      console.error("Failed to fetch real-time weather for admin:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, notifsRes] = await Promise.all([
        axiosInstance.get('/api/weather/alerts'),
        axiosInstance.get('/api/weather/notifications')
      ]);
      setAlerts(alertsRes.data);
      setNotifications(notifsRes.data);
      fetchRealTimeData();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setAlertValidated(true);
      return;
    }

    setAlertValidated(true);
    try {
      await axiosInstance.post('/api/weather/alerts', newAlert);
      Swal.fire({
        title: 'Alert Broadcasted!',
        text: 'The weather alert has been sent to all pilgrims.',
        icon: 'success',
        confirmButtonColor: '#4a2a18'
      });
      setNewAlert({ type: '', message: '', severity: 'Medium' });
      setAlertValidated(false);
      fetchData();
    } catch (error) {
      Swal.fire('Error', 'Failed to create alert', 'error');
    }
  };

  const handleCreateNotification = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setNotificationValidated(true);
      return;
    }

    setNotificationValidated(true);
    try {
      await axiosInstance.post('/api/weather/notifications', newNotification);
      Swal.fire({
        title: 'Announcement Sent!',
        text: 'Pilgrims will see this in their weather dashboard.',
        icon: 'success',
        confirmButtonColor: '#4a2a18'
      });
      setNewNotification({ title: '', content: '', type: 'Manual' });
      setNotificationValidated(false);
      fetchData();
    } catch (error) {
      Swal.fire('Error', 'Failed to send notification', 'error');
    }
  };

  const handleDeleteAlert = async (id) => {
    const result = await Swal.fire({
      title: 'Remove Alert?',
      text: "This alert will disappear from everyone's screen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4a2a18',
      confirmButtonText: 'Delete'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/api/weather/alerts/${id}`);
        fetchData();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete alert', 'error');
      }
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/api/weather/notifications/${id}`);
      fetchData();
    } catch (error) {
      Swal.fire('Error', 'Failed to delete notification', 'error');
    }
  };

  if (loading) return <div className="admin-loading">Initializing Weather Control System...</div>;

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-header-flex">
        <div className="dashboard-header-modern">
          <h1 className="page-title">Weather & Emergency Broadcasting</h1>
          {/* <p className="admin-page-subtitle">Manage real-time alerts and official pilgrim communications.</p> */}
        </div>
        <button onClick={fetchData} className="btn-dashboard-secondary" style={{ width: 'auto', gap: '8px' }}>
          <RefreshCcw size={16} /> Sync System
        </button>
      </div>

      <div className="admin-weather-layout">
        {/* Real-time Monitor Section */}
        <div className="weather-monitor-section">
          <div className="dashboard-form-container monitor-card-fix">
            <div className="form-header-modern">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldAlert size={20} /> Real-Time Sensor Status</h3>
              <div className="live-status">
                <span className="dot"></span> LIVE
              </div>
            </div>
            <div className="monitor-stats-container">
              <div className="stat-pill">
                 <div className="stat-icon-circle"><Thermometer size={20} color="#ff7e36" /></div>
                 <div className="stat-content">
                   <div className="stat-label">Temperature</div>
                   <div className="stat-val">{realTimeWeather?.temperature}°C</div>
                 </div>
              </div>
              <div className="stat-pill">
                 <div className="stat-icon-circle"><Droplets size={20} color="#2196f3" /></div>
                 <div className="stat-content">
                   <div className="stat-label">Humidity</div>
                   <div className="stat-val">{realTimeWeather?.humidity}%</div>
                 </div>
              </div>
              <div className="stat-pill">
                 <div className="stat-icon-circle"><Wind size={20} color="#4caf50" /></div>
                 <div className="stat-content">
                   <div className="stat-label">Wind Speed</div>
                   <div className="stat-val">{realTimeWeather?.windSpeed} km/h</div>
                 </div>
              </div>
              <div className="stat-pill">
                 <div className="stat-icon-circle"><Cloud size={20} color="#C5A059" /></div>
                 <div className="stat-content">
                   <div className="stat-label">Condition</div>
                   <div className="stat-val">{realTimeWeather?.condition}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="weather-management-grid">
          {/* Main Action Area */}
          <div className="action-column">
            <div className="dashboard-form-container">
              <div className="form-header-modern">
                <h3><AlertTriangle size={20} color="#ff3d00" /> Issue Weather Alert</h3>
              </div>
              <form className={`needs-validation ${alertValidated ? 'was-validated' : ''}`} noValidate onSubmit={handleCreateAlert} style={{ padding: '20px' }}>
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label className="form-label-modern">Alert Category <span className="required-mark">*</span></label>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                      className="form-select-modern"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Heavy Rain">Heavy Rain</option>
                      <option value="Heat Wave">Heat Wave</option>
                      <option value="Thunderstorm">Thunderstorm</option>
                      <option value="Dense Fog">Dense Fog</option>
                      <option value="Cold Wave">Cold Wave</option>
                      <option value="Other">Other Emergency</option>
                    </select>
                  </div>
                  <div className="form-group-modern">
                    <label className="form-label-modern">Severity Level</label>
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                      className="form-select-modern"
                    >
                      <option value="Low">Low (Advisory)</option>
                      <option value="Medium">Medium (Caution)</option>
                      <option value="High">High (Danger)</option>
                      <option value="Critical">Critical (Action)</option>
                    </select>
                  </div>
                  <div className="form-group-modern form-span-2">
                    <label className="form-label-modern">Broadcasting Instructions <span className="required-mark">*</span></label>
                    <textarea
                      rows="3"
                      placeholder="What should pilgrims do?"
                      value={newAlert.message}
                      onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                      className="form-textarea-modern"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="form-actions-modern" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-dashboard-primary" style={{ background: '#d32f2f' }}>
                    <Megaphone size={18} /> Broadcast Alert Now
                  </button>
                </div>
              </form>
            </div>

            <div className="dashboard-form-container">
              <div className="form-header-modern">
                <h3><Megaphone size={20} color="#2196f3" /> Official Announcement</h3>
              </div>
              <form className={`needs-validation ${notificationValidated ? 'was-validated' : ''}`} noValidate onSubmit={handleCreateNotification} style={{ padding: '20px' }}>
                <div className="form-grid-modern">
                  <div className="form-group-modern form-span-2">
                    <label className="form-label-modern">Headline <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      placeholder="Brief headline..."
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      className="form-input-modern"
                      required
                    />
                  </div>
                  <div className="form-group-modern form-span-2">
                    <label className="form-label-modern">Message Content <span className="required-mark">*</span></label>
                    <textarea
                      rows="3"
                      placeholder="Full details..."
                      value={newNotification.content}
                      onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                      className="form-textarea-modern"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="form-actions-modern" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-dashboard-primary">
                    <Send size={18} /> Send Broadcast
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* History Column */}
          <div className="history-column">
            <div className="dashboard-form-container">
              <div className="form-header-modern">
                <h3><History size={20} /> Active Alerts</h3>
              </div>
              <div className="broadcast-list" style={{ padding: '15px' }}>
                {alerts.length === 0 ? (
                  <div className="empty-state-small">
                    <CheckCircle size={24} color="#4caf50" />
                    <span>No active alerts. System is clear.</span>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className={`broadcast-item severity-${(alert.severity || 'Medium').toLowerCase()}`}>
                      <div className="item-main">
                        <div className="item-type">{alert.type}</div>
                        <div className="item-msg">{alert.message}</div>
                      </div>
                      <button className="item-delete" onClick={() => handleDeleteAlert(alert.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dashboard-form-container">
              <div className="form-header-modern">
                <h3><History size={20} /> History</h3>
              </div>
              <div className="broadcast-list" style={{ padding: '15px' }}>
                {notifications.length === 0 ? (
                   <div className="empty-state-small">
                     <p>No history.</p>
                   </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="broadcast-item history">
                      <div className="item-main">
                        <div className="item-type">{notif.title}</div>
                        <div className="item-time">{notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString() : 'N/A'}</div>
                      </div>
                      <button className="item-delete" onClick={() => handleDeleteNotification(notif.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-weather-layout {
          display: flex;
          flex-direction: column;
          gap: 30px;
          margin-top: 20px;
        }
        .monitor-card-fix {
          padding: 0 !important;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .monitor-card-fix .form-header-modern {
          padding: 20px 25px !important;
        }
        .live-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #4caf50;
          letter-spacing: 1.5px;
          margin-top: 8px;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #4caf50;
          border-radius: 50%;
          animation: blink 1.5s infinite;
        }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .monitor-stats-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          padding: 25px;
          margin-top: 5px;
        }
        .stat-pill {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 25px;
          background: #fff;
          border: 1px solid rgba(197, 160, 89, 0.15);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }
        .stat-pill:hover {
          transform: translateY(-2px);
          border-color: #ff7e36;
          box-shadow: 0 8px 20px rgba(230, 81, 0, 0.08);
        }
        .stat-icon-circle {
          width: 45px;
          height: 45px;
          background: #fdf5e6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stat-label { 
          font-size: 0.75rem; 
          color: #795d4d; 
          font-weight: 700; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-val { 
          font-size: 1.25rem; 
          font-weight: 800; 
          color: #4a2a18; 
          line-height: 1.2;
        }

        .weather-management-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 30px;
        }
        .action-column, .history-column {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .broadcast-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 350px;
          overflow-y: auto;
        }
        .broadcast-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border-radius: 12px;
          border-left: 5px solid #ccc;
          background: #f9f9f9;
        }
        .severity-critical { border-left-color: #d32f2f; background: #fff5f5; }
        .severity-high { border-left-color: #ff3d00; background: #fff8f5; }
        .severity-medium { border-left-color: #ff9800; background: #fffbf0; }
        .severity-low { border-left-color: #4caf50; background: #f5fff5; }
        .broadcast-item.history { border-left-color: #2196f3; }

        .item-type { font-weight: 800; font-size: 1rem; color: #333; }
        .item-msg { font-size: 0.85rem; color: #666; margin-top: 4px; line-height: 1.4; }
        .item-time { font-size: 0.75rem; color: #999; margin-top: 4px; }
        
        .item-delete { background: none; border: none; color: #ff5252; cursor: pointer; padding: 8px; border-radius: 50%; transition: 0.2s; }
        .item-delete:hover { background: #ffebee; transform: scale(1.1); }

        .empty-state-small {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #999;
          font-weight: 600;
          padding: 30px 0;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .weather-management-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherManagement;
