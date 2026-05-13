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
        // sessionStorage is tab-isolated: each tab/window has its own independent storage.
        // This ensures a logged-in session in one tab is never visible in a new tab/window.
        const savedToken = sessionStorage.getItem('token');
        if (!savedToken) {
            // No token in this tab — but we may still have a valid httpOnly refresh cookie.
            // Attempt a silent token refresh so the user doesn't have to log in again after
            // a page reload within the same tab.
            api.post('/auth/refresh')
                .then(({ data }) => {
                    const refreshedToken = data.token;
                    sessionStorage.setItem('token', refreshedToken);
                    return api.get('/auth/me');
                })
                .then(({ data }) => {
                    const token = sessionStorage.getItem('token');
                    setToken(token);
                    setUser(data);
                    sessionStorage.setItem('user', JSON.stringify(data));
                })
                .catch(() => {
                    // No valid refresh cookie — user is truly logged out in this tab
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
            return;
        }

        // Validate the existing session token against the backend before trusting it
        api.get('/auth/me')
            .then(({ data }) => {
                setToken(savedToken);
                setUser(data);
                // Sync sessionStorage with fresh user data from server
                sessionStorage.setItem('user', JSON.stringify(data));
            })
            .catch(() => {
                // Token is invalid, expired, or user is inactive — clear everything
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!sessionStorage.getItem('token')) return;
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
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('user', JSON.stringify(newUser));
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
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
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
        } catch {
            // Re-sync from server so badge count doesn't drift on network failure
            await fetchNotifications();
        }
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
