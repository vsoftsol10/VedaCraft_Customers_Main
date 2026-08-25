import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://vedacraft-customers-main.onrender.com/api/v1';

const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
};

const handleResponse = async (res) => {
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = (payload && (payload.message || payload.error)) || 'Notifications API error';
        const error = new Error(msg);
        error.status = res.status;
        throw error;
    }
    return payload;
};

export const getNotifications = async (tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token) return [];
    const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const payload = await handleResponse(res);
    return Array.isArray(payload.data) ? payload.data : [];
};

export const markAsRead = async (id, tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token) throw new Error('Please sign in');
    const res = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const payload = await handleResponse(res);
    return Array.isArray(payload.data) ? payload.data : [];
};

export const markAllAsRead = async (tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token) throw new Error('Please sign in');
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const payload = await handleResponse(res);
    return Array.isArray(payload.data) ? payload.data : [];
};

export default { getNotifications, markAsRead, markAllAsRead };