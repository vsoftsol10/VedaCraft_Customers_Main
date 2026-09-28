import { supabaseAdmin, supabase } from '../config/supabase.js';

const getClient = () => supabaseAdmin || supabase;

const isActiveNow = (offer, now = Date.now()) => {
  if (!offer?.is_active) return false;
  const start = offer.start_date ? new Date(offer.start_date).getTime() : -Infinity;
  const end = offer.end_date ? new Date(offer.end_date).getTime() : Infinity;
  return Number.isFinite(start) && Number.isFinite(end) && start <= now && end > now;
};

const discountFor = (offer, price) => {
  const value = Number(offer.discount_value);
  if (!Number.isFinite(value) || value <= 0 || price <= 0) return 0;
  return Math.min(price, offer.discount_type === 'percentage' ? price * value / 100 : value);
};

const toOfferDto = (offer, discountAmount) => ({
  id: offer.id,
  name: offer.offer_name,
  description: offer.offer_description || '',
  discountType: offer.discount_type,
  discountValue: Number(offer.discount_value),
  discountAmount: Number(discountAmount.toFixed(2)),
  scope: offer.scope,
  startDate: offer.start_date,
  endDate: offer.end_date,
});

// Resolves only current offers. This remains non-fatal to callers during a
// rollout where the offers migration has not reached a database yet.
export const getActiveOffersByProductId = async (products = []) => {
  const validProducts = products.filter((product) => product?.id && product?.seller_id);
  if (!validProducts.length) return new Map();

  const client = getClient();
  const nowIso = new Date().toISOString();
  const { data: offers, error } = await client
    .from('offers')
    .select('id, seller_id, offer_name, offer_description, discount_type, discount_value, scope, start_date, end_date, is_active')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${nowIso}`)
    .or(`end_date.is.null,end_date.gt.${nowIso}`);
  if (error) throw error;

  const activeOffers = (offers || []).filter(isActiveNow);
  if (!activeOffers.length) return new Map();
  const selectedOfferIds = activeOffers.filter((offer) => offer.scope === 'select_products').map((offer) => offer.id);
  let selectedProductIdsByOfferId = new Map();
  if (selectedOfferIds.length) {
    const { data: links, error: linksError } = await client
      .from('offer_products')
      .select('offer_id, product_id')
      .in('offer_id', selectedOfferIds);
    if (linksError) throw linksError;
    selectedProductIdsByOfferId = (links || []).reduce((map, link) => {
      const productIds = map.get(link.offer_id) || new Set();
      productIds.add(String(link.product_id));
      map.set(link.offer_id, productIds);
      return map;
    }, new Map());
  }

  const offersByProductId = new Map();
  validProducts.forEach((product) => {
    const basePrice = Number(product.selling_price ?? product.price ?? 0);
    let best = null;
    activeOffers.forEach((offer) => {
      const matchesScope = offer.scope === 'all_products' || selectedProductIdsByOfferId.get(offer.id)?.has(String(product.id));
      if (String(offer.seller_id) !== String(product.seller_id) || !matchesScope) return;
      const discount = discountFor(offer, basePrice);
      if (!best || discount > best.discount) best = { offer, discount };
    });
    if (best?.discount > 0) offersByProductId.set(String(product.id), toOfferDto(best.offer, best.discount));
  });
  return offersByProductId;
};

export const applyOfferToPrice = (price, offer) => {
  const basePrice = Number(price);
  const discount = Number(offer?.discountAmount);
  if (!Number.isFinite(basePrice) || !Number.isFinite(discount)) return basePrice;
  return Number(Math.max(0, basePrice - discount).toFixed(2));
};
