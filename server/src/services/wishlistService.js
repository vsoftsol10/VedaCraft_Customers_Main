import { createScopedClient } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';

const PRODUCT_COLUMNS = 'id, name, slug, description, price, discount_price, stock, rating, total_reviews, is_featured, is_active, created_at, updated_at, image_url';

const toProductDto = (product) => {
  if (!product) return null;

  const imageUrl = product.image_url || product.image || '';
  const images = Array.isArray(product.images)
    ? product.images
    : imageUrl
    ? [imageUrl]
    : [];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price || 0),
    discount_price: product.discount_price === null ? null : Number(product.discount_price),
    stock: product.stock,
    rating: Number(product.rating || 0),
    total_reviews: product.total_reviews,
    is_featured: product.is_featured,
    is_active: product.is_active,
    created_at: product.created_at,
    updated_at: product.updated_at,
    image: imageUrl,
    images,
  };
};

const getProductsByIds = async (productIds, token) => {
  if (!productIds.length) return [];

  const supabase = createScopedClient(token);
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .in('id', productIds)
    .eq('is_active', true);

  if (error) throw new AppError(error.message, 500);

  return (data || []).map(toProductDto).filter(Boolean);
};

const findActiveProductId = async (filters, token) => {
  const supabase = createScopedClient(token);
  let query = supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .limit(1);

  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query.maybeSingle();

  if (error) throw new AppError(error.message, 500);
  return data?.id ? Number(data.id) : null;
};

const resolveProductId = async (product, token) => {
  const requestedId = Number(product?.id ?? product?.product_id);

  if (Number.isFinite(requestedId) && requestedId > 0) {
    const activeProductId = await findActiveProductId({ id: requestedId }, token);
    if (activeProductId) return activeProductId;
  }

  const slug = String(product?.slug || '').trim();
  if (slug) {
    const activeProductId = await findActiveProductId({ slug }, token);
    if (activeProductId) return activeProductId;
  }

  if (!Number.isFinite(requestedId) || requestedId <= 0) {
    throw new AppError('Product id is required', 400);
  }

  throw new AppError('Product not found', 404);
};

const buildWishlistResponse = async (rows, token) => {
  if (!rows?.length) return [];

  const productIds = [...new Set(rows.map((row) => row.product_id).filter(Boolean))];
  const products = await getProductsByIds(productIds, token);
  const productMap = new Map(products.map((product) => [product.id, product]));

  return rows
    .map((row) => ({
      id: row.id,
      product_id: row.product_id,
      created_at: row.created_at,
      product: productMap.get(row.product_id) || null,
    }))
    .filter((entry) => entry.product);
};

export const getWishlist = async (userId, token) => {
  const supabase = createScopedClient(token);
  const { data, error } = await supabase
    .from('wishlists')
    .select('id, product_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  const wishlistRows = await buildWishlistResponse(data || [], token);
  return wishlistRows.map((entry) => entry.product);
};

export const toggleItem = async (userId, product, token) => {
  const productId = await resolveProductId(product, token);

  const supabase = createScopedClient(token);

  const { data: existing, error: lookupError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);
  if (existing) {
    return getWishlist(userId, token);
  }

  const { error: insertError } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, product_id: productId });

  if (insertError) throw new AppError(insertError.message, 500);

  return getWishlist(userId, token);
};

export const removeItem = async (userId, productId, token) => {
  const normalizedProductId = Number(productId);

  if (!Number.isFinite(normalizedProductId) || normalizedProductId <= 0) {
    throw new AppError('Product id is required', 400);
  }

  const supabase = createScopedClient(token);

  const { data: existing, error: lookupError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', normalizedProductId)
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);
  if (!existing) throw new AppError('Wishlist item not found', 404);

  const { error: deleteError } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', normalizedProductId);

  if (deleteError) throw new AppError(deleteError.message, 500);

  return getWishlist(userId, token);
};
