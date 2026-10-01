import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getProductStore = async (req, res, next) => {
  try {
    if (!supabaseAdmin) return sendSuccess(res, null, 'Store details retrieved successfully');

    const { data: product, error: productError } = await supabaseAdmin
      .from('seller_products')
      .select('seller_id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (productError) throw productError;
    if (!product?.seller_id) return sendSuccess(res, null, 'Store details retrieved successfully');

    const [{ data: application, error: applicationError }, { data: products, error: productsError, count: productCount }] = await Promise.all([
      supabaseAdmin
        .from('seller_applications')
        .select('store_name, business_name')
        // seller_products.seller_id is the seller application ID in the seller
        // catalog. Older records may contain the seller auth user ID, so keep
        // that lookup as a backwards-compatible fallback.
        .or(`id.eq.${product.seller_id},user_id.eq.${product.seller_id}`)
        .maybeSingle(),
      supabaseAdmin
        .from('seller_products')
        .select('id', { count: 'exact' })
        .eq('seller_id', product.seller_id),
    ]);
    if (applicationError) throw applicationError;
    if (productsError) throw productsError;

    const productIds = (products || []).map(({ id }) => String(id));
    const { data: reviewRatings, error: reviewsError } = productIds.length
      ? await supabaseAdmin.from('product_reviews').select('rating').in('product_id', productIds)
      : { data: [], error: null };
    if (reviewsError) throw reviewsError;

    const ratings = reviewRatings || [];
    return sendSuccess(res, {
      name: application?.store_name || application?.business_name || 'Vedha Craft Store',
      product_count: productCount || 0,
      ratings_count: ratings.length,
      average_rating: ratings.length
        ? Number((ratings.reduce((total, review) => total + Number(review.rating || 0), 0) / ratings.length).toFixed(1))
        : 0,
    }, 'Store details retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
