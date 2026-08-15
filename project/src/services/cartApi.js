import { supabase } from '../lib/supabase';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api/v1';
const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
};
const requestCart = async (path, options = {}, tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token)
        throw new Error('Please sign in to use cart sync');
    const res = await fetch(`${API_BASE_URL}/cart${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = payload?.message || payload?.error || 'Cart API error';
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }
    return Array.isArray(payload?.data) ? payload.data : [];
};
export const getCart = async () => {
    return requestCart('', { method: 'GET' });
};
export const getCartWithToken = async (token) => {
    return requestCart('', { method: 'GET' }, token);
};
export const addToCart = async (item, token) => {
    return requestCart('', {
        method: 'POST',
        body: JSON.stringify({
            id: item.id,
            slug: item.slug,
            name: item.name,
            price: item.price,
            image: item.image,
            rating: item.rating,
            quantity: item.quantity,
        }),
    }, token);
};
export const updateQuantity = async (productId, quantity, token) => {
    return requestCart(`/${encodeURIComponent(String(productId))}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    }, token);
};
export const removeFromCart = async (productId, token) => {
    return requestCart(`/${encodeURIComponent(String(productId))}`, { method: 'DELETE' }, token);
};
export const clearCart = async (token) => {
    return requestCart('/clear', { method: 'DELETE' }, token);
};
