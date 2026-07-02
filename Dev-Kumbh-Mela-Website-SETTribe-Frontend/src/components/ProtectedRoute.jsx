import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute component that handles authentication and role checking.
 * Redirects to /login if not authenticated.
 * Redirects to /access-denied if role requirements are not met.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0f172a',
                color: '#fff',
                fontFamily: 'var(--font-dashboard-heading)'
            }}>
                <div className="loader">Verifying Sacred Credentials...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // If not logged in, redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based protection (Case-insensitive check)
    if (allowedRoles) {
        const userRole = String(user?.role || '').toLowerCase().trim();
        const normalizedAllowedRoles = allowedRoles.map(role => String(role).toLowerCase().trim());
        


        if (!normalizedAllowedRoles.includes(userRole)) {
            console.warn(`Access Denied: Role "${userRole}" is not authorized for this route.`);
            // We redirect authenticated users with wrong roles to Access Denied
            return <Navigate to="/access-denied" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
