import React, { createContext, useState, useEffect, useContext } from 'react';
import { settingsService } from '../api/services/settingsService';

const AdminSettingsContext = createContext();

export const AdminSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        systemNotifications: true,
        maintenanceMode: false,
        publicRegistration: true,
        autoBackup: true,
        highSecurity: false,
        realtimeLogs: true,
        theme: 'light'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await settingsService.getSettings();
            if (response.data) {
                setSettings(response.data);
                // Apply theme immediately
                document.body.className = response.data.theme === 'light' ? '' : `theme-${response.data.theme}`;
            }
        } catch (error) {
            console.error("Failed to fetch admin settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            const response = await settingsService.updateSettings(newSettings);
            if (response.data) {
                setSettings(response.data);
                document.body.className = response.data.theme === 'light' ? '' : `theme-${response.data.theme}`;
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to update admin settings", error);
            return false;
        }
    };

    return (
        <AdminSettingsContext.Provider value={{ settings, updateSettings, loading, fetchSettings }}>
            {children}
        </AdminSettingsContext.Provider>
    );
};

export const useAdminSettings = () => useContext(AdminSettingsContext);
