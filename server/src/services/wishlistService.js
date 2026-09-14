import { createScopedClient } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';
import { getProductDtosByIds } from './productService.js';

const normalizeProductId = (value) => {
  const productId = String(value ?? '').trim();

  if (!productId) {
    throw new AppError('Product id is required', 400);
  }

  return productId;
};

const getProductSnapshot = (product) => {
  const price = Number(product?.price);
  const rating = Number(product?.rating);

  return {
    product_slug: product?.slug || null,
    product_name: product?.name || null,
    product_category: product?.category || null,
    product_price: Number.isFinite(price) ? price : null,
    product_image: product?.image || null,
    product_rating: Number.isFinite(rating) ? rating : null,
  };
};

const mapWishlistRow = (row, product) => {
  const originalPrice = Number(product?.price);
  const discountPrice = product?.discount_price === null || product?.discount_price === undefined
    ? null
    : Number(product.discount_price);
  const snapshotPrice = Number(row.product_price || 0);
  const salePrice = Number.isFinite(discountPrice) && discountPrice >= 0
    ? discountPrice
    : Number.isFinite(originalPrice)
      ? originalPrice
      : snapshotPrice;

  return {
    id: String(row.product_id),
    slug: product?.slug || row.product_slug || undefined,
    name: product?.name || row.product_name || 'Product',
    category: product?.category || row.product_category || undefined,
    description: product?.description || '',
    price: Number.isFinite(originalPrice) ? originalPrice : salePrice,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : salePrice,
    discount_price: Number.isFinite(discountPrice) ? discountPrice : null,
    offer: product?.offer || undefined,
    stock: 1,
    rating: row.product_rating === null || row.product_rating === undefined
      ? 0
      : Number(row.product_rating),
    total_reviews: 0,
    is_featured: false,
    is_active: true,
    created_at: row.created_at,
    updated_at: row.created_at,
    image: product?.image || row.product_image || '',
    images: product?.images?.length ? product.images : row.product_image ? [row.product_image] : [],
  };
};

export const getWishlist = async (userId, token) => {
  const supabase = createScopedClient(token);
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      product_id,
      product_slug,
      product_name,
      product_category,
      product_price,
      product_image,
      product_rating,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  const rows = data || [];
  let productsById = new Map();

  try {
    productsById = await getProductDtosByIds(rows.map((item) => item.product_id));
  } catch (error) {
    console.warn('Failed to enrich wishlist items with product pricing', error);
  }

  return rows.map((item) => mapWishlistRow(item, productsById.get(String(item.product_id))));
};

export const toggleItem = async (userId, product, token) => {
  const productId = normalizeProductId(product?.id ?? product?.product_id);
  const snapshot = getProductSnapshot(product);
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
    .insert({ user_id: userId, product_id: productId, ...snapshot });

  if (insertError) throw new AppError(insertError.message, 500);

  return getWishlist(userId, token);
};

export const removeItem = async (userId, productIdValue, token) => {
  const productId = normalizeProductId(productIdValue);
  const supabase = createScopedClient(token);

  const { data: existing, error: lookupError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);
  if (!existing) throw new AppError('Wishlist item not found', 404);

  const { error: deleteError } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (deleteError) throw new AppError(deleteError.message, 500);

  return getWishlist(userId, token);
};
