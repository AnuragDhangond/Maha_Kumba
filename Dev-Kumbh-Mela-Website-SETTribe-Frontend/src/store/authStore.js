import { create } from 'zustand';
import { authService } from '../api/services/authService';

const useAuthStore = create((set, get) => ({
    user: null,
    loading: true, // Start with loading true until first check completes
    isAuthenticated: false,
    isAdmin: false,

    checkAuth: async () => {
        try {
            const response = await authService.getCurrentUser();
            const userData = response.data;
            
            set({ 
                user: userData, 
                isAuthenticated: true, 
                isAdmin: String(userData?.role || '').toLowerCase() === 'admin',
                loading: false 
            });
        } catch (error) {
            // 401 is expected if the user is not logged in, so we only log it as a debug/info message
            if (error.response?.status === 401) {
                console.log("No active session found (Guest mode)");
            } else {
                console.error("Auth check failed:", error);
            }
            
            // If check fails, we are definitely not authenticated
            set({ user: null, isAuthenticated: false, isAdmin: false, loading: false });
        }
    },

    login: (userData) => {
        console.log("Setting user in store:", userData);
        set({ 
            user: userData, 
            isAuthenticated: true, 
            isAdmin: String(userData?.role || '').toLowerCase() === 'admin',
            loading: false
        });
        return userData;
    },

    logout: async () => {
        try {
            await authService.logoutUser();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false, isAdmin: false, loading: false });
        }
    }
}));

if (typeof window !== 'undefined') {
    window.addEventListener('auth-failed', () => {
        useAuthStore.setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false });
    });
}

export default useAuthStore;
