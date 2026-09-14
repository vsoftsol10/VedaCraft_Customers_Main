import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';

const getProductClient = () => {
  const url = process.env.PRODUCT_SUPABASE_URL;
  const key = process.env.PRODUCT_SUPABASE_SERVICE_ROLE_KEY || process.env.PRODUCT_SUPABASE_ANON_KEY;

  if (url) {
    if (!key) {
      throw new AppError(
        'PRODUCT_SUPABASE_SERVICE_ROLE_KEY or PRODUCT_SUPABASE_ANON_KEY is required for inventory updates',
        500
      );
    }

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

const normalizeOrderItems = (items = []) => {
  const quantityByProductId = new Map();

  for (const item of Array.isArray(items) ? items : []) {
    const productId = String(item?.product_id ?? item?.id ?? '').trim();
    const quantity = Number(item?.quantity ?? 0);

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      continue;
    }

    quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + quantity);
  }

  return [...quantityByProductId.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

const getProductsByIds = async (productIds) => {
  const client = getProductClient();
  const ids = [...new Set(productIds.map((id) => String(id).trim()).filter(Boolean))];

  if (ids.length === 0) return new Map();

  const { data, error } = await client
    .from('products')
    .select('id, name, quantity')
    .in('id', ids);

  if (error) throw new AppError(error.message, 500);

  return new Map((data || []).map((product) => [String(product.id), product]));
};

const getProductsById = async (stockItems) => {
  return getProductsByIds(stockItems.map((item) => item.productId));
};

export const getStockByProductIds = async (productIds) => {
  const productsById = await getProductsByIds(productIds);

  return new Map(
    [...productsById.entries()].map(([id, product]) => [
      id,
      Math.max(0, Number(product.quantity) || 0),
    ])
  );
};

export const assertStockAvailable = async (items) => {
  const stockItems = normalizeOrderItems(items);
  const productsById = await getProductsById(stockItems);

  for (const item of stockItems) {
    const product = productsById.get(item.productId);
    const availableQuantity = Number(product?.quantity ?? 0);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (availableQuantity < item.quantity) {
      throw new AppError(
        `${product.name || 'Product'} has only ${availableQuantity} item(s) in stock`,
        400
      );
    }
  }
};

export const decrementStockForItems = async (items) => {
  const stockItems = normalizeOrderItems(items);
  const productsById = await getProductsById(stockItems);
  const client = getProductClient();

  for (const item of stockItems) {
    const product = productsById.get(item.productId);
    const availableQuantity = Number(product?.quantity ?? 0);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (availableQuantity < item.quantity) {
      throw new AppError(
        `${product.name || 'Product'} has only ${availableQuantity} item(s) in stock`,
        400
      );
    }
  }

  for (const item of stockItems) {
    const product = productsById.get(item.productId);
    const availableQuantity = Number(product.quantity || 0);

    const { error } = await client
      .from('products')
      .update({ quantity: availableQuantity - item.quantity })
      .eq('id', item.productId)
      .select('id')
      .single();

    if (error) throw new AppError(error.message, 500);
  }
};

export const restoreStockForItems = async (items) => {
  const stockItems = normalizeOrderItems(items);
  const productsById = await getProductsById(stockItems);
  const client = getProductClient();

  for (const item of stockItems) {
    const product = productsById.get(item.productId);
    if (!product) continue;

    const currentQuantity = Number(product.quantity || 0);
    const { error } = await client
      .from('products')
      .update({ quantity: currentQuantity + item.quantity })
      .eq('id', item.productId)
      .select('id')
      .single();

    if (error) throw new AppError(error.message, 500);
  }
};
