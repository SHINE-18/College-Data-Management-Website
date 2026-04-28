import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const pollIntervalRef = useRef(null);

    // Verify token with backend on app load — prevents stale/invalid tokens from granting access
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
            setLoading(false);
            return;
        }

        // Validate the token against the backend before trusting it
        api.get('/auth/me')
            .then(({ data }) => {
                setToken(savedToken);
                setUser(data);
                // Sync localStorage with fresh user data from server
                localStorage.setItem('user', JSON.stringify(data));
            })
            .catch(() => {
                // Token is invalid, expired, or user is inactive — clear everything
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {
            // Silently ignore — user might not be logged in or backend might be offline
        }
    }, []);

    // Poll for new notifications every 60 seconds when logged in
    useEffect(() => {
        if (token) {
            fetchNotifications(); // fetch immediately on login
            pollIntervalRef.current = setInterval(fetchNotifications, 60000);
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [token, fetchNotifications]);

    const login = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout'); // Clears the httpOnly refresh token cookie
        } catch {
            // Ignore errors — still clear local state
        }
        setToken(null);
        setUser(null);
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const markNotificationRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    const clearAllNotifications = async () => {
        try {
            await api.delete('/notifications/clear');
            setNotifications([]);
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    const value = {
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
        clearAllNotifications,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
