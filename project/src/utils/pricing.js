const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const isOfferActive = (offer) => {
  if (!offer || typeof offer !== 'object') return false;
  const now = Date.now();
  const start = offer.startDate ?? offer.start_date;
  const end = offer.endDate ?? offer.end_date;
  return (!start || new Date(start).getTime() <= now) && (!end || new Date(end).getTime() > now);
};

const parseOfferDiscount = (offer, mrp) => {
  if (offer && typeof offer === 'object') {
    const amount = Number(offer.discountAmount ?? offer.discount_amount);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }
  const text = String(offer || '');
  const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return mrp * (Number(percentMatch[1]) / 100);
  }

  const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i);
  if (amountMatch && /(?:₹|rs\.?|inr|off)/i.test(text)) {
    return Number(amountMatch[1]);
  }

  return 0;
};

export const roundPrice = (value) => {
  const number = toFiniteNumber(value);
  return number === null ? 0 : Math.max(0, Number(number.toFixed(2)));
};

export const getProductPricing = (item = {}) => {
  const mrp = roundPrice(item.originalPrice ?? item.mrp ?? item.price);
  const sellingPrice = toFiniteNumber(item.sellingPrice ?? item.selling_price);
  const explicitDiscountPrice = toFiniteNumber(item.discountPrice ?? item.discount_price);
  const candidateOffer = item.activeOffer ?? item.active_offer;
  const activeOffer = isOfferActive(candidateOffer) ? candidateOffer : null;
  const offerDiscount = mrp > 0 ? parseOfferDiscount(activeOffer || item.offer, sellingPrice ?? mrp) : 0;
  const offerBasePrice = sellingPrice ?? explicitDiscountPrice ?? item.price ?? mrp;
  const offeredPrice = offerDiscount > 0 ? roundPrice(offerBasePrice - offerDiscount) : null;
  const salePrice = roundPrice(activeOffer ? (offeredPrice ?? sellingPrice ?? item.price ?? mrp) : (sellingPrice ?? explicitDiscountPrice ?? offeredPrice ?? item.price ?? mrp));
  const hasDiscount = mrp > salePrice;
  const discountAmount = hasDiscount ? roundPrice(mrp - salePrice) : 0;
  const discountPercent = hasDiscount && mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;

  return {
    mrp,
    salePrice,
    discountAmount,
    discountPercent,
    hasDiscount,
  };
};
