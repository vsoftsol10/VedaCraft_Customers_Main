import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Only storefront-safe review fields are returned: customer and order IDs stay private.
export const getProductReviews = async (req, res, next) => {
  try {
    if (!supabaseAdmin) return sendSuccess(res, [], 'Product reviews retrieved successfully');

    const { data, error } = await supabaseAdmin
      .from('product_reviews')
      .select('id, product_name, rating, comment, image_urls, created_at')
      .eq('product_id', String(req.params.id))
      .order('created_at', { ascending: false });
    if (error) throw error;

    return sendSuccess(res, (data || []).map((review) => ({
      ...review,
      reviewer_name: 'Verified customer',
      image_urls: Array.isArray(review.image_urls) ? review.image_urls : [],
    })), 'Product reviews retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
