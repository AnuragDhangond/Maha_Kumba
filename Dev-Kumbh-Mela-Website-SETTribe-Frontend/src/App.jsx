import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';
import './styles/ResponsiveAdminTables.css';
import './styles/kumbh-chat.css';
import useActivityTracker from './hooks/useActivityTracker';
import useResponsiveAdminTables from './hooks/useResponsiveAdminTables';
import AppRouter from './routes/AppRouter';
import KumbhCompanion from './components/chat-widget/KumbhCompanion';
import useAuthStore from './store/authStore';
import { authService } from './api/services/authService';

/**
 * Main App Component
 */
function App() {
  const { pathname } = useLocation();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Global activity tracking
  useActivityTracker();
  // useResponsiveAdminTables();

  // Ensure page scrolls to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    const adminContent = document.querySelector('.admin-content');
    if (adminContent) {
      adminContent.scrollTop = 0;
      adminContent.scrollLeft = 0;
    }
  }, [pathname]);

  // Proactive Token Refresh (Every 14.5 minutes)
  useEffect(() => {
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 min 
    const interval = setInterval(async () => {
      try {
        console.log('Proactively refreshing sacred token...');
        await authService.refreshUserToken();
      } catch (error) {
        console.error('Proactive refresh failed:', error);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AppRouter />
      {/* <KumbhCompanion /> */}
    </>
  );
}

export default App;
