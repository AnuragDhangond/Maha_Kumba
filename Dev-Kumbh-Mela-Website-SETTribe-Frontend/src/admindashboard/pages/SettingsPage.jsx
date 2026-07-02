import React, { useState } from 'react';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';

const SettingsPage = () => {
    const { settings, updateSettings, loading } = useAdminSettings();
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const cycleTheme = async () => {
        const themes = ['light', 'dark', 'spiritual'];
        const currentTheme = settings.theme || 'light';
        const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
        const newTheme = themes[nextIndex];
        const success = await updateSettings({ ...settings, theme: newTheme });
        if(success) showToast(`Theme changed to ${newTheme.toUpperCase()}`);
        else showToast(`Failed to change theme`);
    };

    const toggleSetting = async (key) => {
        const newValue = !settings[key];
        const success = await updateSettings({ ...settings, [key]: newValue });
        const friendlyName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        if (success) {
            showToast(`${friendlyName} ${newValue ? 'Enabled' : 'Disabled'}`);
        } else {
            showToast(`Failed to update ${friendlyName}`);
        }
    };

    if (loading) return <div className="admin-page-content">Loading settings...</div>;

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">System Settings</h1>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                {/* 1. Appearance */}
                <div className="settings-card-luxury">

                    <h3 className="settings-group-title">Appearance & Theme</h3>
                    <div className="setting-item-premium">
                        <div className="setting-meta">
                            <h4>Dashboard Theme</h4>
                            <p>Cycle between Light, Dark, and Spiritual themes.</p>
                        </div>
                        <div className={`theme-cycle-btn phase-${settings.theme}`} onClick={cycleTheme}>

                            <span className="theme-name">{settings.theme.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Data Management */}
                <div className="settings-card-luxury">
                
                    <h3 className="settings-group-title">Data Management</h3>
                    <div className="setting-item-premium">
                        <div className="setting-meta">
                            <h4>Automatic Daily Backups<sup style={{ color: 'orange', fontSize: '10px' }}> (upcoming feature)</sup></h4>
                            <p>Backup user data and logs every 24h.</p>
                        </div>
                        <div className={`switch-luxury ${settings.autoBackup ? 'active' : ''}`} onClick={() => toggleSetting('autoBackup')} />
                    </div>
                    <div className="setting-item-premium">
                        <div className="setting-meta">
                            <h4>Realtime Error Logging <sup style={{ color: 'orange', fontSize: '10px' }}> (upcoming feature)</sup></h4>
                            <p>Track system bottlenecks in real-time.</p>
                        </div>
                        <div className={`switch-luxury ${settings.realtimeLogs ? 'active' : ''}`} onClick={() => toggleSetting('realtimeLogs')} />
                    </div>
                    <div className="setting-item-premium">
                        <div className="setting-meta">
                            <h4>Public Registration</h4>
                            <p>Allow new pilgrims to register via website.</p>
                        </div>
                        <div className={`switch-luxury ${settings.publicRegistration ? 'active' : ''}`} onClick={() => toggleSetting('publicRegistration')} />
                    </div>
                </div>

                {/* 3. Notifications */}
                <div className="settings-card-luxury">

                    <h3 className="settings-group-title">Notification Settings</h3>
                    <div className="setting-item-premium">
                        <div className="setting-meta">
                            <h4>System Notifications</h4>
                            <p>Receive in-app alerts for system events.</p>
                        </div>
                        <div className={`switch-luxury ${settings.systemNotifications ? 'active' : ''}`} onClick={() => toggleSetting('systemNotifications')} />
                    </div>
                </div>

                {/* 4. Security */}
                <div className="settings-card-luxury">

                    <h3 className="settings-group-title">System & Security</h3>
                  
                        
                          
                 
                    <div className="setting-item-premium">
                        <div className="setting-meta">
                            <h4>Maintenance Mode</h4>
                            <p>Disable public access for updates.</p>
                        </div>
                        <div className={`switch-luxury ${settings.maintenanceMode ? 'active' : ''}`} onClick={() => toggleSetting('maintenanceMode')} />
                    </div>
                    <div className="setting-item-premium">
                        <div className="setting-meta">
                            <h4>High Security Level (MFA) <sup style={{ color: 'orange', fontSize: '10px' }}> (upcoming feature)</sup></h4>
                            <p>Multi-factor authentication for portal.</p>
                        </div>
                        <div className={`switch-luxury ${settings.highSecurity ? 'active' : ''}`} onClick={() => toggleSetting('highSecurity')} />
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="admin-toast-notification">
                    <span style={{ marginRight: '8px' }}>✓</span>
                    {toast}
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
