import useAuthStore from '../store/authStore';

/**
 * Custom hook for accessing authentication state and methods.
 * @returns {Object} { user, login, logout, loading, isAuthenticated, isAdmin }
 */
const useAuth = () => {
    return useAuthStore();
};

export default useAuth;
