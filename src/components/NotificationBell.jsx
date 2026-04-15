// ============================================
// components/NotificationBell.jsx
// ============================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const { notifications, unreadCount, markNotificationRead, clearAllNotifications, fetchNotifications } = useAuth();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = async (notification) => {
        await markNotificationRead(notification._id);
        setOpen(false);
        if (notification.link) navigate(notification.link);
    };

    const typeColors = {
        notice: 'bg-blue-500',
        assignment: 'bg-amber-500',
        leave: 'bg-purple-500',
        result: 'bg-green-500',
        general: 'bg-gray-500',
    };

    const typeIcons = {
        notice: '📢',
        assignment: '📝',
        leave: '📋',
        result: '📊',
        general: '🔔',
    };

    return (
        <div ref={dropdownRef} className="relative" id="notification-bell">
            <button
                onClick={() => { setOpen(!open); fetchNotifications(); }}
                className="relative p-2 rounded-full text-primary-100 hover:bg-white/10 transition focus:outline-none"
                aria-label="Notifications"
                id="notification-bell-btn"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="text-xs text-gray-400 hover:text-red-500 transition"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <div className="text-3xl mb-2">🔔</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <button
                                    key={n._id}
                                    onClick={() => handleClick(n)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`flex-shrink-0 w-7 h-7 rounded-full ${typeColors[n.type] || 'bg-gray-500'} flex items-center justify-center text-sm`}>
                                            {typeIcons[n.type] || '🔔'}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!n.isRead && <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
