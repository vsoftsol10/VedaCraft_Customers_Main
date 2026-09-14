import { createScopedClient } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';
import { assertStockAvailable, getStockByProductIds } from './inventoryService.js';
import { getProductDtosByIds } from './productService.js';

const normalizeProductId = (value) => {
  const productId = String(value ?? '').trim();

  if (!productId) {
    throw new AppError('Product id is required', 400);
  }

  return productId;
};

const normalizeQuantity = (value, fallback = 1) => {
  const quantity = Number(value ?? fallback);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Quantity must be a positive integer', 400);
  }

  return quantity;
};

const getItemSnapshot = (item) => {
  const price = Number(item?.price);
  const rating = Number(item?.rating);

  return {
    product_slug: item?.slug || null,
    product_name: item?.name || null,
    product_category: item?.category || null,
    product_price: Number.isFinite(price) ? price : null,
    product_image: item?.image || null,
    product_rating: Number.isFinite(rating) ? rating : null,
  };
};

const resolveProductId = (item) => {
  return normalizeProductId(item?.id ?? item?.product_id);
};

const getOrCreateCart = async (userId, token) => {
  const supabase = createScopedClient(token);

  const { data: existing, error: lookupError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);
  if (existing?.id) return existing.id;

  const { data: created, error: createError } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (createError) throw new AppError(createError.message, 500);
  return created.id;
};

const mapCartRow = (row, stock, product) => {
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
    price: salePrice,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : salePrice,
    discountPrice: Number.isFinite(discountPrice) ? discountPrice : undefined,
    offer: product?.offer || undefined,
    image: product?.image || row.product_image || '',
    quantity: row.quantity,
    stock,
    rating: row.product_rating === null || row.product_rating === undefined
      ? undefined
      : Number(row.product_rating),
  };
};

export const getCart = async (userId, token) => {
  const supabase = createScopedClient(token);

  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (cartError) throw new AppError(cartError.message, 500);
  if (!cart?.id) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      product_slug,
      product_name,
      product_category,
      product_price,
      product_image,
      product_rating,
      quantity,
      created_at
    `)
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: true });

  if (error) throw new AppError(error.message, 500);

  const cartRows = data || [];
  const stockByProductId = await getStockByProductIds(cartRows.map((item) => item.product_id));
  let productsById = new Map();

  try {
    productsById = await getProductDtosByIds(cartRows.map((item) => item.product_id));
  } catch (error) {
    console.warn('Failed to enrich cart items with product pricing', error);
  }

  return cartRows
    .map((item) => mapCartRow(
      item,
      stockByProductId.get(String(item.product_id)),
      productsById.get(String(item.product_id))
    ))
    .filter((item) => item.id);
};

export const addItem = async (userId, item, token) => {
  const productId = resolveProductId(item);
  const quantity = normalizeQuantity(item?.quantity, 1);
  const snapshot = getItemSnapshot(item);
  const supabase = createScopedClient(token);
  const cartId = await getOrCreateCart(userId, token);

  const { data: existing, error: lookupError } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);

  if (existing) {
    await assertStockAvailable([{ id: productId, quantity: existing.quantity + quantity }]);

    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity, ...snapshot })
      .eq('id', existing.id);

    if (updateError) throw new AppError(updateError.message, 500);
    return getCart(userId, token);
  }

  await assertStockAvailable([{ id: productId, quantity }]);

  const { error: insertError } = await supabase
    .from('cart_items')
    .insert({ cart_id: cartId, product_id: productId, quantity, ...snapshot });

  if (insertError) throw new AppError(insertError.message, 500);

  return getCart(userId, token);
};

export const updateItemQuantity = async (userId, productIdValue, quantityValue, token) => {
  const productId = normalizeProductId(productIdValue);
  const quantity = normalizeQuantity(quantityValue);
  const supabase = createScopedClient(token);
  const cartId = await getOrCreateCart(userId, token);

  const { data: existing, error: lookupError } = await supabase
    .from('cart_items')
    .select('id')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);
  if (!existing) throw new AppError('Cart item not found', 404);

  await assertStockAvailable([{ id: productId, quantity }]);

  const { error: updateError } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', existing.id);

  if (updateError) throw new AppError(updateError.message, 500);

  return getCart(userId, token);
};

export const removeItem = async (userId, productIdValue, token) => {
  const productId = normalizeProductId(productIdValue);
  const supabase = createScopedClient(token);
  const cartId = await getOrCreateCart(userId, token);

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId);

  if (error) throw new AppError(error.message, 500);

  return getCart(userId, token);
};

export const clearCart = async (userId, token) => {
  const supabase = createScopedClient(token);
  const cartId = await getOrCreateCart(userId, token);

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);

  if (error) throw new AppError(error.message, 500);

  return [];
};
