import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '/api';

const api = axios.create({
    baseURL: normalizedApiUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Required to send/receive httpOnly cookies (refresh token)
});

export const getAssetUrl = (assetPath) => {
    if (!assetPath) return '';
    if (/^https?:\/\//i.test(assetPath)) return assetPath;
    if (!rawApiUrl || rawApiUrl.startsWith('/')) return assetPath;
    return `${normalizedApiUrl.replace(/\/api$/, '')}${assetPath}`;
};

export function getSessionUser() {
    try {
        return JSON.parse(sessionStorage.getItem('user'));
    } catch {
        return null;
    }
}

// Add access token from sessionStorage to every request
// sessionStorage is tab-isolated so each browser tab maintains its own independent session
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// 401 interceptor: silently refresh access token, then retry original request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh for 401s that aren't the auth endpoints themselves
        if (
            error.response?.status === 401 &&
            originalRequest && !originalRequest._retry &&
            sessionStorage.getItem('token') &&
            getSessionUser()?.role !== 'student' &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/student-auth')
        ) {
            originalRequest._retry = true;
            if (isRefreshing) {
                // Queue requests while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const { data } = await api.post('/auth/refresh', { userId: getSessionUser()?._id });
                if (data.userId !== getSessionUser()?._id) throw new Error('Session changed');
                const newToken = data.token;
                sessionStorage.setItem('token', newToken);
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh failed — clear state and redirect to login
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
