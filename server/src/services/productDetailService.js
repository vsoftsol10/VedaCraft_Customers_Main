import { getProductByIdOrSlug } from './productService.js';
import { AppError } from '../utils/apiResponse.js';

const toHighlightObject = (highlight) => {
  if (highlight && typeof highlight === 'object') {
    return {
      title: highlight.title || highlight.name || 'Product highlight',
      desc: highlight.desc || highlight.description || highlight.text || '',
    };
  }

  return {
    title: String(highlight || 'Product highlight'),
    desc: '',
  };
};

export const getProductDetail = async (idOrSlug) => {
  const product = await getProductByIdOrSlug(idOrSlug);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const highlights = product.product_highlights?.length
    ? product.product_highlights
    : product.highlights;

  return {
    id: product.id,
    product_id: product.id,
    subtitle: product.short_description,
    full_description: product.description,
    how_to_use: product.how_to_use,
    core_instructions: product.core_instruction,
    care_instructions: null,
    materials: null,
    ingredients: null,
    highlights: (highlights || []).map(toHighlightObject),
    specifications: product.specifications || {},
    dimensions: null,
    shipping_info: null,
    seo_title: product.name,
    seo_description: product.short_description || product.description,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
};

export const upsertProductDetail = async () => {
  throw new AppError('Product detail updates are managed in Supabase products table', 400);
};
