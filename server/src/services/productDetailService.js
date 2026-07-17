import { getPrisma } from '../config/prisma.js';
import { AppError } from '../utils/apiResponse.js';

const DETAIL_FIELDS = {
  subtitle: ['subtitle'],
  fullDescription: ['fullDescription', 'full_description'],
  howToUse: ['howToUse', 'how_to_use'],
  coreInstructions: ['coreInstructions', 'core_instructions'],
  careInstructions: ['careInstructions', 'care_instructions'],
  materials: ['materials'],
  ingredients: ['ingredients'],
  highlights: ['highlights'],
  specifications: ['specifications'],
  dimensions: ['dimensions'],
  shippingInfo: ['shippingInfo', 'shipping_info'],
  seoTitle: ['seoTitle', 'seo_title'],
  seoDescription: ['seoDescription', 'seo_description'],
};

const toDetailDto = (detail) => {
  if (!detail) return null;

  return {
    id: Number(detail.id),
    product_id: Number(detail.productId),
    subtitle: detail.subtitle,
    full_description: detail.fullDescription,
    how_to_use: detail.howToUse,
    core_instructions: detail.coreInstructions,
    care_instructions: detail.careInstructions,
    materials: detail.materials,
    ingredients: detail.ingredients,
    highlights: detail.highlights,
    specifications: detail.specifications,
    dimensions: detail.dimensions,
    shipping_info: detail.shippingInfo,
    seo_title: detail.seoTitle,
    seo_description: detail.seoDescription,
    created_at: detail.createdAt,
    updated_at: detail.updatedAt,
  };
};

const normalizeDetailInput = (payload) => {
  const input = {};

  for (const [field, aliases] of Object.entries(DETAIL_FIELDS)) {
    const key = aliases.find((alias) => payload[alias] !== undefined);
    if (key) input[field] = payload[key];
  }

  return input;
};

export const getProductId = async (idOrSlug) => {
  const value = String(idOrSlug || '').trim();
  const prisma = getPrisma();
  const product = /^\d+$/.test(value)
    ? await prisma.product.findUnique({ where: { id: BigInt(value) }, select: { id: true } })
    : await prisma.product.findUnique({ where: { slug: value }, select: { id: true } });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product.id;
};

export const getProductDetail = async (idOrSlug) => {
  const productId = await getProductId(idOrSlug);
  const detail = await getPrisma().productDetail.findUnique({
    where: { productId },
  });

  return toDetailDto(detail);
};

export const upsertProductDetail = async (idOrSlug, payload) => {
  const productId = await getProductId(idOrSlug);
  const data = normalizeDetailInput(payload);

  if (Object.keys(data).length === 0) {
    throw new AppError('No product detail fields provided', 400);
  }

  const detail = await getPrisma().productDetail.upsert({
    where: { productId },
    create: {
      productId,
      ...data,
    },
    update: data,
  });

  return toDetailDto(detail);
};
