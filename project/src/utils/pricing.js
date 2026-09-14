const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const parseOfferDiscount = (offer, mrp) => {
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
  const explicitDiscountPrice = toFiniteNumber(item.discountPrice ?? item.discount_price);
  const offerDiscount = mrp > 0 ? parseOfferDiscount(item.offer, mrp) : 0;
  const offeredPrice = offerDiscount > 0 ? roundPrice(mrp - offerDiscount) : null;
  const salePrice = roundPrice(explicitDiscountPrice ?? offeredPrice ?? item.price ?? mrp);
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
