import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Request interceptor to attach JWT token to headers if present in localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


let refreshPromise = null;

const refreshAuthToken = async () => {
    if (!refreshPromise) {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        refreshPromise = axios({
            method: 'post',
            url: `${API_URL}/users/refresh`,
            headers: { 'Content-Type': 'application/json' },
            data: storedRefreshToken ? { refreshToken: storedRefreshToken } : null,
            withCredentials: true
        }).then((response) => {
            const token = response.data?.token;
            const newRefreshToken = response.data?.refreshToken;
            if (token) {
                localStorage.setItem('jwtToken', token);
            }
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            return response;
        }).catch((err) => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event('auth-failed'));
            }
            throw err;
        }).finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

// Response interceptor - handle expired tokens with silent refresh.
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';

        const isAuthError = error.response && (error.response.status === 401 || error.response.status === 403);
        const isAuthEndpoint = ['/users/login', '/users/refresh', '/users/logout', '/users/me'].some((path) =>
            requestUrl.includes(path)
        );

        // CRITICAL FIX: If there is no stored token, skip the refresh entirely.
        // Without this check, a guest user (no token) causes an infinite loop:
        // 401 -> try refresh -> refresh 401 -> auth-failed event -> re-render -> 401 -> ...
        // This crashes iOS Safari with RangeError: Maximum call stack size exceeded.
        const hasStoredToken = !!localStorage.getItem('jwtToken');

        if (isAuthError && !originalRequest?._retry && !isAuthEndpoint && hasStoredToken) {
            originalRequest._retry = true;

            try {
                await refreshAuthToken();
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
export { refreshAuthToken };

