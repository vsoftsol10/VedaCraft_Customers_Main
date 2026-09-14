import { supabase } from '../lib/supabase';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://vedacraft-customers-main.onrender.com/api/v1';
const CART_REQUEST_TIMEOUT_MS = 12000;
const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
};
const requestCart = async (path, options = {}, tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token)
        throw new Error('Please sign in to use cart sync');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CART_REQUEST_TIMEOUT_MS);
    let res;
    try {
        res = await fetch(`${API_BASE_URL}/cart${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });
    }
    catch (cause) {
        if (cause?.name === 'AbortError') {
            const error = new Error('Cart is taking too long to load. Please try again.');
            error.status = 408;
            throw error;
        }
        throw cause;
    }
    finally {
        window.clearTimeout(timeout);
    }
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
    const productId = item.product_id ?? item.id;
    return requestCart('', {
        method: 'POST',
        body: JSON.stringify({
            product_id: String(productId),
            slug: item.slug,
            name: item.name,
            category: item.category,
            price: item.price,
            originalPrice: item.originalPrice,
            discountPrice: item.discountPrice,
            offer: item.offer,
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
