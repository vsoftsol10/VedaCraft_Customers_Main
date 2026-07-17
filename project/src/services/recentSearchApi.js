import { supabase } from '../lib/supabase';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://veda-craft.onrender.com/api/v1';
const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? `Bearer ${token}` : null;
};
export const fetchRecentSearches = async () => {
    const auth = await getAuthHeader();
    if (!auth)
        return [];
    const res = await fetch(`${API_BASE_URL}/recent-searches`, {
        headers: { Authorization: auth },
    });
    if (!res.ok)
        return [];
    const json = await res.json();
    return json.data || [];
};
export const saveRecentSearch = async (query) => {
    const auth = await getAuthHeader();
    if (!auth)
        return;
    const res = await fetch(`${API_BASE_URL}/recent-searches`, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || 'Failed to save recent search');
    }
};
export const deleteRecentSearch = async (query) => {
    const auth = await getAuthHeader();
    if (!auth)
        return;
    await fetch(`${API_BASE_URL}/recent-searches`, {
        method: 'DELETE',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
};
export const clearRecentSearches = async () => {
    const auth = await getAuthHeader();
    if (!auth)
        return;
    await fetch(`${API_BASE_URL}/recent-searches/clear`, {
        method: 'DELETE',
        headers: { Authorization: auth },
    });
};
