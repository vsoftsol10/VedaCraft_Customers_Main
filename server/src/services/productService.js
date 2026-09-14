import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, supabase } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';

const PRODUCT_COLUMNS = `
  id,
  name,
  slug,
  category,
  short_description,
  highlights,
  price,
  product_highlights,
  offer,
  description,
  how_to_use,
  core_instruction,
  quantity,
  images,
  image_public_ids,
  status,
  created_at,
  updated_at
`;

const CATEGORY_ALIASES = new Map([
  ['wellness', 'Wellness'],
  ['food', 'Food'],
  ['organic-food', 'Food'],
  ['craft', 'Craft'],
  ['artisan-crafts', 'Craft'],
  ['fashion', 'Fashion'],
  ['sustainable-fashion', 'Fashion'],
  ['decor', 'Decor Items'],
  ['decor-items', 'Decor Items'],
  ['home-decor-items', 'Decor Items'],
  ['seller', 'Seller'],
  ['eco', 'Seller'],
  ['eco-friendly-products', 'Seller'],
]);

const DEFAULT_RATING = 4.5;

const normalizeCategory = (value) => {
  const category = String(value || '').trim();
  if (!category) return undefined;

  const key = category.toLowerCase().replaceAll('_', '-').replace(/\s+/g, '-');
  return CATEGORY_ALIASES.get(key) || category;
};

const getProductClient = () => {
  const url = process.env.PRODUCT_SUPABASE_URL;
  const key = process.env.PRODUCT_SUPABASE_SERVICE_ROLE_KEY || process.env.PRODUCT_SUPABASE_ANON_KEY;

  if (url && key) {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseAdmin || supabase;
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const parseOfferPercent = (offer) => {
  const match = String(offer || '').match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 0;
};

const toCategorySlug = (category) => {
  const normalized = normalizeCategory(category);
  if (normalized === 'Decor Items') return 'decor';
  if (normalized === 'Seller') return 'eco';
  return String(normalized || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const toProductDto = (product) => {
  if (!product) return null;

  const images = ensureArray(product.images);
  const price = Number(product.price || 0);
  const discountPercent = parseOfferPercent(product.offer);
  const discountPrice = discountPercent > 0
    ? Math.max(0, Number((price * (1 - discountPercent / 100)).toFixed(2)))
    : null;

  return {
    id: product.id,
    category_id: null,
    category: product.category,
    mainCategory: product.category,
    category_slug: toCategorySlug(product.category),
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description || product.short_description || '',
    price,
    discount_price: discountPrice,
    stock: Number(product.quantity || 0),
    quantity: Number(product.quantity || 0),
    rating: DEFAULT_RATING,
    total_reviews: 0,
    is_featured: product.status === 'published',
    is_active: product.status === 'published',
    image: images[0] || '',
    images,
    image_public_ids: ensureArray(product.image_public_ids),
    offer: product.offer,
    status: product.status,
    product_highlights: ensureArray(product.product_highlights),
    highlights: ensureArray(product.highlights),
    specifications: {
      mainCategory: product.category,
      productHighlights: ensureArray(product.product_highlights),
      highlights: ensureArray(product.highlights),
      offer: product.offer,
    },
    how_to_use: product.how_to_use,
    core_instruction: product.core_instruction,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
};

const paginationMeta = ({ page, limit, count }) => {
  const totalPages = Math.ceil((count || 0) / limit);
  return {
    page,
    limit,
    total: count || 0,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const applyFilters = (query, filters) => {
  let nextQuery = filters.status ? query.eq('status', filters.status) : query;

  if (filters.category) {
    nextQuery = nextQuery.eq('category', normalizeCategory(filters.category));
  }

  if (filters.search) {
    const term = filters.search.replaceAll('%', '').replaceAll(',', ' ').trim();
    if (term) {
      nextQuery = nextQuery.or(
        `name.ilike.%${term}%,slug.ilike.%${term}%,category.ilike.%${term}%,short_description.ilike.%${term}%,description.ilike.%${term}%`
      );
    }
  }

  if (filters.minPrice !== undefined) {
    nextQuery = nextQuery.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    nextQuery = nextQuery.lte('price', filters.maxPrice);
  }

  if (filters.inStock === true) {
    nextQuery = nextQuery.gt('quantity', 0);
  } else if (filters.inStock === false) {
    nextQuery = nextQuery.eq('quantity', 0);
  }

  return nextQuery;
};

export const getProducts = async (filters) => {
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  const client = getProductClient();

  let query = client
    .from('products')
    .select(PRODUCT_COLUMNS, { count: 'exact' });

  query = applyFilters(query, filters)
    .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  return {
    products: (data || []).map(toProductDto),
    meta: paginationMeta({ page: filters.page, limit: filters.limit, count }),
  };
};

export const getProductByIdOrSlug = async (idOrSlug) => {
  const value = String(idOrSlug).trim();
  const client = getProductClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  let query = client
    .from('products')
    .select(PRODUCT_COLUMNS)
    .limit(1);

  query = isUuid ? query.eq('id', value) : query.eq('slug', value);

  const { data, error } = await query.maybeSingle();

  if (error) throw new AppError(error.message, 500);
  return toProductDto(data);
};

export const getProductDtosByIds = async (ids = []) => {
  const productIds = [...new Set(ids.map((id) => String(id || '').trim()).filter(Boolean))];
  if (productIds.length === 0) return new Map();

  const client = getProductClient();
  const { data, error } = await client
    .from('products')
    .select(PRODUCT_COLUMNS)
    .in('id', productIds);

  if (error) throw new AppError(error.message, 500);

  return new Map((data || []).map((product) => [String(product.id), toProductDto(product)]));
};

export const getProductsByCategory = async (category, filters) => {
  return getProducts({
    ...filters,
    category,
  });
};

export const searchProducts = async (search, filters) => {
  return getProducts({
    ...filters,
    search,
  });
};
