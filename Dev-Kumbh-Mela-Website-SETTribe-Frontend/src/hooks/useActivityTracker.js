import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { activityService } from '../api/services/activityService';

const useActivityTracker = () => {
    const location = useLocation();
    const lastTrackedPath = useRef('');

    useEffect(() => {
        const trackPageVisit = async (currentPath) => {
            if (lastTrackedPath.current === currentPath) return;
            lastTrackedPath.current = currentPath;

            try {
                await activityService.trackActivity({
                    pageVisited: currentPath
                });
            } catch (error) {
                console.error("Activity tracking failed:", error);
            }
        };

        trackPageVisit(location.pathname);
    }, [location.pathname]);
};

export default useActivityTracker;
