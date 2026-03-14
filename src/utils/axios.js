import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '/api';

const api = axios.create({
    baseURL: normalizedApiUrl,
    headers: { 'Content-Type': 'application/json' },
});

export const getAssetUrl = (assetPath) => {
    if (!assetPath) return '';
    if (/^https?:\/\//i.test(assetPath)) return assetPath;
    if (!rawApiUrl || rawApiUrl.startsWith('/')) return assetPath;
    return `${normalizedApiUrl.replace(/\/api$/, '')}${assetPath}`;
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
