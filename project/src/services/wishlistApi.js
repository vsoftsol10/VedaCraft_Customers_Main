import { supabase } from '../lib/supabase';
import { mapApiProductToProduct } from '../types/product';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://veda-craft.onrender.com/api/v1';
const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
};
const handleResponse = async (res) => {
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = (payload && (payload.message || payload.error)) || 'Wishlist API error';
        const error = new Error(msg);
        error.status = res.status;
        throw error;
    }
    return payload;
};
export const getWishlist = async (tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token)
        return [];
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const payload = await handleResponse(res);
    const items = Array.isArray(payload.data) ? payload.data : [];
    return items.map(mapApiProductToProduct);
};
export const addToWishlist = async (product, tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token)
        throw new Error('Please sign in to use wishlist');
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: product.id }),
    });
    const payload = await handleResponse(res);
    const items = Array.isArray(payload.data) ? payload.data : [];
    return items.map(mapApiProductToProduct);
};
export const removeFromWishlist = async (productId, tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token)
        throw new Error('Please sign in to use wishlist');
    const res = await fetch(`${API_BASE_URL}/wishlist/${encodeURIComponent(String(productId))}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const payload = await handleResponse(res);
    const items = Array.isArray(payload.data) ? payload.data : [];
    return items.map(mapApiProductToProduct);
};
export default {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};
