import { supabaseAdmin, supabase } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';
import { getActiveOffersByProductId } from './offerService.js';

// The seller catalog belongs to the primary Supabase project (SUPABASE_URL).
const getProductClient = () => supabaseAdmin || supabase;
const PRODUCT_COLUMNS = `id, product_id, product_name, category, sub_category, material, weight, description, benefits, highlights, length, width, height, mrp, discount_price, selling_price, cover_image, additional_images, sku, stock_quantity, low_stock_alert, stock_status, how_to_use, care_instruction, seller_id, created_at, updated_at`;

const CATEGORY_ALIASES = new Map([
  ['wellness', 'Wellness'], ['food', 'Food'], ['organic-food', 'Food'], ['craft', 'Craft'],
  ['artisan-crafts', 'Craft'], ['fashion', 'Fashion'], ['sustainable-fashion', 'Fashion'],
  ['decor', 'Decor Items'], ['decor-items', 'Decor Items'], ['home-decor-items', 'Decor Items'],
  ['seller', 'Seller'], ['eco', 'Seller'], ['eco-friendly-products', 'Seller'],
]);
const normalizeCategory = (value) => {
  const category = String(value || '').trim();
  if (!category) return undefined;
  return CATEGORY_ALIASES.get(category.toLowerCase().replaceAll('_', '-').replace(/\s+/g, '-')) || category;
};
const ensureArray = (value) => Array.isArray(value) ? value.filter(Boolean) : (typeof value === 'string' && value.trim() ? [value.trim()] : []);
const toCategorySlug = (category) => {
  const normalized = normalizeCategory(category);
  if (normalized === 'Decor Items') return 'decor';
  if (normalized === 'Seller') return 'eco';
  return String(normalized || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const toProductDto = (product, activeOffer = null) => {
  if (!product) return null;
  const images = [product.cover_image, ...ensureArray(product.additional_images)].filter(Boolean);
  const sellingPrice = Number(product.selling_price || 0);
  const mrp = Number(product.mrp || sellingPrice);
  const discountPrice = product.discount_price === null || product.discount_price === undefined
    ? (sellingPrice < mrp ? sellingPrice : null) : Number(product.discount_price);
  const stock = Math.max(0, Number(product.stock_quantity) || 0);
  const legacyOffer = mrp > sellingPrice ? `${Math.round(((mrp - sellingPrice) / mrp) * 100)}% OFF` : null;
  return {
    id: product.id, product_id: product.product_id, category_id: null, category: product.category,
    mainCategory: product.category, category_slug: toCategorySlug(product.category), name: product.product_name,
    // product_id is the stable, human-readable URL identifier in seller_products.
    slug: String(product.product_id || product.id), short_description: product.description || '',
    description: product.description || '', price: sellingPrice, base_selling_price: sellingPrice, mrp, selling_price: sellingPrice,
    original_price: mrp, discount_price: discountPrice, stock, quantity: stock,
    rating: 4.5, total_reviews: 0, is_featured: false, is_active: product.stock_status !== 'Out of Stock',
    image: images[0] || '', images, image_public_ids: [], offer: activeOffer || legacyOffer, active_offer: activeOffer, status: product.stock_status,
    product_highlights: ensureArray(product.highlights), highlights: ensureArray(product.highlights),
    specifications: {
      mainCategory: product.category, subCategory: product.sub_category, material: product.material, weight: product.weight,
      dimensions: { length: product.length, width: product.width, height: product.height }, benefits: product.benefits,
      productHighlights: ensureArray(product.highlights), highlights: ensureArray(product.highlights), offer: activeOffer || legacyOffer,
    },
    how_to_use: product.how_to_use, core_instruction: product.care_instruction,
    created_at: product.created_at, updated_at: product.updated_at,
  };
};

const paginationMeta = ({ page, limit, count }) => {
  const totalPages = Math.ceil((count || 0) / limit);
  return { page, limit, total: count || 0, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
};
const applyFilters = (query, filters) => {
  let nextQuery = filters.status ? query.eq('stock_status', filters.status) : query;
  if (filters.category) nextQuery = nextQuery.eq('category', normalizeCategory(filters.category));
  if (filters.search) {
    const term = filters.search.replaceAll('%', '').replaceAll(',', ' ').trim();
    if (term) nextQuery = nextQuery.or(`product_name.ilike.%${term}%,product_id.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (filters.minPrice !== undefined) nextQuery = nextQuery.gte('selling_price', filters.minPrice);
  if (filters.maxPrice !== undefined) nextQuery = nextQuery.lte('selling_price', filters.maxPrice);
  if (filters.inStock === true) nextQuery = nextQuery.gt('stock_quantity', 0);
  else if (filters.inStock === false) nextQuery = nextQuery.eq('stock_quantity', 0);
  return nextQuery;
};
const sortColumn = (value) => ({ price: 'selling_price', name: 'product_name', quantity: 'stock_quantity', status: 'stock_status' }[value] || value);

export const getProducts = async (filters) => {
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  let query = getProductClient().from('seller_products').select(PRODUCT_COLUMNS, { count: 'exact' });
  query = applyFilters(query, filters).order(sortColumn(filters.sortBy), { ascending: filters.sortOrder === 'asc' }).range(from, to);
  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);
  let offersByProductId = new Map();
  try { offersByProductId = await getActiveOffersByProductId(data || []); }
  catch (offerError) { console.warn('Failed to load active offers:', offerError.message); }
  return { products: (data || []).map((product) => toProductDto(product, offersByProductId.get(String(product.id)))), meta: paginationMeta({ page: filters.page, limit: filters.limit, count }) };
};
export const getProductByIdOrSlug = async (idOrSlug) => {
  const value = String(idOrSlug).trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  let query = getProductClient().from('seller_products').select(PRODUCT_COLUMNS).limit(1);
  query = isUuid ? query.eq('id', value) : query.eq('product_id', value);
  const { data, error } = await query.maybeSingle();
  if (error) throw new AppError(error.message, 500);
  let activeOffer = null;
  try { activeOffer = (await getActiveOffersByProductId(data ? [data] : [])).get(String(data?.id)); }
  catch (offerError) { console.warn('Failed to load active offer:', offerError.message); }
  return toProductDto(data, activeOffer);
};
export const getProductDtosByIds = async (ids = []) => {
  const productIds = [...new Set(ids.map((id) => String(id || '').trim()).filter(Boolean))];
  if (!productIds.length) return new Map();
  const { data, error } = await getProductClient().from('seller_products').select(PRODUCT_COLUMNS).in('id', productIds);
  if (error) throw new AppError(error.message, 500);
  let offersByProductId = new Map();
  try { offersByProductId = await getActiveOffersByProductId(data || []); }
  catch (offerError) { console.warn('Failed to load active offers:', offerError.message); }
  return new Map((data || []).map((product) => [String(product.id), toProductDto(product, offersByProductId.get(String(product.id)))]));
};
export const getProductsByCategory = async (category, filters) => getProducts({ ...filters, category });
export const searchProducts = async (search, filters) => getProducts({ ...filters, search });
