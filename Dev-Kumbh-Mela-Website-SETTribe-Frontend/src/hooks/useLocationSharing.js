import { useEffect, useRef, useState, useCallback } from 'react';
import { crowdService } from '../api/services/crowdService';

// NASHIK KUMBH MELA BOUNDS
// Covers: Nashik city, Ramkund, Tapovan, Trimbakeshwar pilgrimage corridor
// Source: Geographical survey of Nashik district Kumbh Mela zone
const NASHIK_BOUNDS = {
    lat: { min: 19.85, max: 20.15 },
    lng: { min: 73.50, max: 73.95 },
};

// Send GPS ping every 20 seconds to balance accuracy and battery life.
const PING_INTERVAL_MS = 20_000;

// localStorage key for anonymous device identity
const DEVICE_ID_KEY = 'kumbh_device_id';

// UTILITY: Anonymous Device Identity
// Generates a random UUID-style ID on first visit, persisted in localStorage.
// This ID is NOT tied to any user account or personal data.
const getOrCreateDeviceId = () => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = `kd_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
};

// UTILITY: Coordinate Boundary Validation
// Rejects coordinates outside the Nashik Kumbh Mela zone.
// Prevents GPS spoofing and eliminates noise from users outside the event area.
const isWithinNashikBounds = (lat, lng) => {
    return (
        lat >= NASHIK_BOUNDS.lat.min &&
        lat <= NASHIK_BOUNDS.lat.max &&
        lng >= NASHIK_BOUNDS.lng.min &&
        lng <= NASHIK_BOUNDS.lng.max
    );
};

// HOOK: useLocationSharing
//
// Responsibilities:
//   1. Request geolocation permission with a clear user prompt
//   2. Generate and persist an anonymous deviceId (no PII stored)
//   3. Validate coordinates are within Nashik Kumbh Mela bounds
//   4. Send GPS ping every 20s via crowdService.pingLocation()
//   5. Pause pings when browser tab is hidden (battery optimization)
//   6. Notify backend on disconnect via crowdService.disconnectUser()
//   7. Use navigator.sendBeacon() on page unload for reliable cleanup
//
// Returns:
//   { isSharing, permissionState, error, startSharing, stopSharing, deviceId }
const useLocationSharing = () => {
    const [isSharing, setIsSharing]           = useState(false);
    const [permissionState, setPermissionState] = useState('idle');
    // permissionState: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'

    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // Refs stay stable across renders and are safe inside callbacks.
    const watchIdRef      = useRef(null);
    const intervalRef     = useRef(null);
    const lastPositionRef = useRef(null);
    const isSharingRef    = useRef(false);
    const deviceIdRef     = useRef(getOrCreateDeviceId());

    useEffect(() => {
        isSharingRef.current = isSharing;
    }, [isSharing]);

    const cleanupTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        lastPositionRef.current = null;
        setIsSharing(false);
        isSharingRef.current = false;
    }, []);

    const sendPing = useCallback(async (position) => {
        if (!position || !position.coords) return;
        const { latitude, longitude } = position.coords;

        if (!isWithinNashikBounds(latitude, longitude)) {
            return;
        }

        try {
            await crowdService.pingLocation({
                deviceId:  deviceIdRef.current,
                latitude,
                longitude,
            });
        } catch (err) {
            console.warn('[LocationSharing] Ping failed:', err);
        }
    }, []);

    const startPingInterval = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (lastPositionRef.current) {
                sendPing(lastPositionRef.current);
            }
        }, PING_INTERVAL_MS);
    }, [sendPing]);

    const startSharing = useCallback((options = { showPrompt: true }) => {
        if (!navigator.geolocation) {
            setPermissionState('unavailable');
            setError('Geolocation is not supported by this browser.');
            return;
        }

        if (options.showPrompt) {
            setPermissionState('requesting');
        }

        const handleSuccess = (position) => {
            setPermissionState('granted');
            setError(null);
            lastPositionRef.current = position;
            setUserLocation([position.coords.latitude, position.coords.longitude]);

            if (!isSharingRef.current) {
                sendPing(position);
                startPingInterval();
                setIsSharing(true);
                isSharingRef.current = true;
            }
        };

        const handleError = (geoError) => {
            console.error('[LocationSharing] Geolocation error:', geoError);
            if (geoError.code === geoError.PERMISSION_DENIED) {
                setPermissionState('denied');
                setError('Location permission denied.');
                cleanupTracking();
            } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                setPermissionState('unavailable');
                setError('Location information is unavailable.');
            } else if (geoError.code === geoError.TIMEOUT) {
                // If timeout, we don't necessarily stop sharing, just wait for next update
                console.warn('[LocationSharing] Geolocation timeout');
            }
        };

        // Start watching position
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, [sendPing, cleanupTracking, startPingInterval]);

    const stopSharing = useCallback(() => {
        cleanupTracking();
        crowdService.disconnectUser(deviceIdRef.current).catch(() => {});
    }, [cleanupTracking]);

    // EFFECT: Tab Visibility - pause/resume pings to save battery.
    // When the user switches tabs, GPS watch continues (OS level) but we
    // stop sending network requests until the tab is visible again.
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!isSharingRef.current) return;

            if (document.hidden) {
                // Tab hidden: pause interval while keeping watchPosition running.
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else {
                // Tab visible: resume interval immediately.
                startPingInterval();
                // Send one ping right away after returning to tab
                if (lastPositionRef.current) {
                    sendPing(lastPositionRef.current);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [sendPing, startPingInterval]);

    // EFFECT: Unmount Cleanup
    // Uses navigator.sendBeacon() for reliable disconnect even on tab close.
    // sendBeacon() is designed to fire even if the page is being unloaded,
    // unlike fetch() or axios which may be cancelled by the browser.
    useEffect(() => {
        return () => {
            cleanupTracking();

            // Reliable disconnect on page unload / component unmount
            try {
                const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;
                const payload  = JSON.stringify({ deviceId: deviceIdRef.current });
                navigator.sendBeacon(
                    `${API_BASE}/api/crowd-status/disconnect`,
                    new Blob([payload], { type: 'application/json' })
                );
            } catch {
                // sendBeacon is not available in all environments.
            }
        };
    }, [cleanupTracking]);

    return {
        isSharing,
        permissionState,
        error,
        startSharing,
        stopSharing,
        userLocation,
        deviceId: deviceIdRef.current,
    };
};

export default useLocationSharing;
