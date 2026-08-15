const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://veda-craft.onrender.com/api/v1'
const toQueryString = (query = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
};
const normalizeProduct = (product) => {
    const images = Array.isArray(product.images) ? product.images : [];
    const firstImage = product.image || images[0] || '';
    const specs = product.specifications || {};
    return {
        ...product,
        images,
        image: firstImage,
        price: Number(product.discount_price ?? product.price),
        rating: Number(product.rating || 0),
        total_reviews: Number(product.total_reviews || 0),
        specifications: specs,
        section: specs.section || undefined,
        mainCategory: specs.mainCategory || product.category,
    };
};
const request = async (path) => {
    const response = await fetch(`${API_BASE_URL}${path}`);
    const payload = await response.json();
    if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to fetch products');
    }
    return payload;
};
export const getProducts = async (query) => {
    const payload = await request(`/products${toQueryString(query)}`);
    return {
        products: payload.data.map(normalizeProduct),
        meta: payload.meta,
    };
};
/**
 * Fetch a single product by its numeric database ID.
 * Calls: GET /products/:id  (backend detects numeric and queries by id column)
 */
export const getProductById = async (id) => {
    const payload = await request(`/products/${id}`);
    return normalizeProduct(payload.data);
};
/**
 * Fetch a single product by its URL slug.
 * Calls: GET /products/:slug  (backend detects non-numeric and queries by slug column)
 *
 * NOTE: The backend exposes a single route GET /products/:id which internally
 * resolves by numeric ID or slug (see server/src/services/productService.js:
 * getProductByIdOrSlug). A dedicated GET /products/slug/:slug endpoint would
 * be the ideal long-term solution to separate these concerns at the routing
 * level. Document this as a backend TODO.
 */
export const getProductBySlug = async (slug) => {
    const payload = await request(`/products/${encodeURIComponent(slug)}`);
    return normalizeProduct(payload.data);
};
export const getProductsByCategory = async (category, query) => {
    const payload = await request(`/products/category/${encodeURIComponent(category)}${toQueryString(query)}`);
    return {
        products: payload.data.map(normalizeProduct),
        meta: payload.meta,
    };
};
export const searchProducts = async (query, options) => {
    return getProducts({ ...options, search: query });
};
export const getProductDetails = async (idOrSlug) => {
    const payload = await request(`/products/${encodeURIComponent(idOrSlug)}/details`);
    return payload.data;
};
