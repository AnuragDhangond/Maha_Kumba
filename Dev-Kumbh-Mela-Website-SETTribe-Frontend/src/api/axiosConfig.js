import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
});


let refreshPromise = null;

const refreshAuthToken = async () => {
    if (!refreshPromise) {
        refreshPromise = axios({
            method: 'post',
            url: `${API_URL}/users/refresh`,
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        }).then((response) => {
            return response;
        }).catch((err) => {
            if (typeof window !== 'undefined') {
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
        const isAuthEndpoint = ['/users/login', '/users/refresh', '/users/logout'].some((path) =>
            requestUrl.includes(path)
        );

        if (isAuthError && !originalRequest?._retry && !isAuthEndpoint) {
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

