import { supabase } from '../lib/supabase';
import { mapApiProductToProduct } from '../types/product';
import { allProducts } from '../data/allProducts';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://vedacraft-customers-main.onrender.com/api/v1'
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
const toSlug = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
const localProductMap = new Map(
    allProducts.map((product) => [toSlug(product.slug || product.name), product])
);
const mapWishlistProduct = (apiProduct) => {
    const product = mapApiProductToProduct(apiProduct);
    const localProduct = localProductMap.get(toSlug(product.slug || product.name));
    if (!localProduct?.image || product.image)
        return product;
    return {
        ...product,
        image: localProduct.image,
        images: localProduct.images?.length ? localProduct.images : [localProduct.image],
    };
};
const getPayloadData = async (path) => {
    const res = await fetch(`${API_BASE_URL}${path}`);
    const payload = await handleResponse(res);
    return payload?.data;
};
const findProductFromSearch = async (product, slug) => {
    const search = String(product?.name || slug || '').trim();
    if (!search)
        return null;
    const data = await getPayloadData(`/products?search=${encodeURIComponent(search)}&limit=100`);
    const products = Array.isArray(data) ? data : [];
    return products.find((item) => {
        const itemSlug = toSlug(item?.slug || item?.name);
        return (slug && itemSlug === slug) || item?.name?.toLowerCase() === product?.name?.toLowerCase();
    }) || null;
};
const resolveWishlistProduct = async (product) => {
    const slug = toSlug(product?.slug || product?.name);
    let backendProduct = null;

    try {
        if (slug) {
            backendProduct = await getPayloadData(`/products/${encodeURIComponent(slug)}`);
        }
    }
    catch {
        backendProduct = null;
    }

    if (!backendProduct?.id) {
        try {
            backendProduct = await findProductFromSearch(product, slug);
        }
        catch {
            backendProduct = null;
        }
    }

    if (backendProduct?.id) {
        return { ...product, id: backendProduct.id, slug: backendProduct.slug || slug };
    }

    const fallbackId = Number(product?.id);
    if (Number.isFinite(fallbackId) && fallbackId > 0 && !slug) {
        return product;
    }

    throw new Error('This product is not available for wishlist yet');
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
    return items.map(mapWishlistProduct);
};
export const addToWishlist = async (product, tokenOverride) => {
    const token = tokenOverride ?? await getToken();
    if (!token)
        throw new Error('Please sign in to use wishlist');
    const wishlistProduct = await resolveWishlistProduct(product);
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: wishlistProduct.id, slug: wishlistProduct.slug }),
    });
    const payload = await handleResponse(res);
    const items = Array.isArray(payload.data) ? payload.data : [];
    return items.map(mapWishlistProduct);
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
    return items.map(mapWishlistProduct);
};
export default {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};
