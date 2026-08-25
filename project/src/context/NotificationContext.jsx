import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as notificationApi from '../services/notificationApi';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const { user, accessToken, authReady, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!authReady) return;

    if (!user || !accessToken) {
      setNotifications([]);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const items = await notificationApi.getNotifications(accessToken);
      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      if (err?.status === 401) {
        setNotifications([]);
        await logout();
        return;
      }
      console.warn('Failed to load notifications', err);
      setError(err?.message || 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  }, [accessToken, authReady, logout, user]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (mounted) await load();
    };
    void run();

    return () => {
      mounted = false;
    };
  }, [load]);

  useEffect(() => {
    if (!authReady || !user || !accessToken) return undefined;

    const intervalId = window.setInterval(() => {
      void load();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [accessToken, authReady, load, user]);

  const markAsRead = async (id) => {
    if (!user || !accessToken) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      const items = await notificationApi.markAsRead(id, accessToken);
      if (Array.isArray(items)) setNotifications(items);
    } catch (err) {
      console.warn('Failed to mark notification as read', err);
      setError(err?.message || 'Unable to update notification');
      await load(); // revert to server truth on failure
    }
  };

  const markAllAsRead = async () => {
    if (!user || !accessToken) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      const items = await notificationApi.markAllAsRead(accessToken);
      if (Array.isArray(items)) setNotifications(items);
    } catch (err) {
      console.warn('Failed to mark all notifications as read', err);
      setError(err?.message || 'Unable to update notifications');
      await load();
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const value = {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: load,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (ctx === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}
