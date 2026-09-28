import { supabase } from '../lib/supabase';

export const REVIEW_IMAGES_BUCKET = 'review-images';
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://vedacraft-customers-main.onrender.com/api/v1';

function extensionFor(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
}

export async function uploadReviewImages(userId, orderId, files) {
  if (files.length > MAX_IMAGES) throw new Error('You can upload up to 5 photos.');
  const paths = [];

  try {
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error('Photos must be JPG, PNG, or WebP files.');
      }
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error('Each photo must be 5 MB or smaller.');
      }

      const path = `${userId}/${orderId}/${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error } = await supabase.storage
        .from(REVIEW_IMAGES_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw new Error(error.message);
      paths.push(path);
    }
    return paths;
  } catch (error) {
    if (paths.length) await supabase.storage.from(REVIEW_IMAGES_BUCKET).remove(paths);
    throw error;
  }
}

export async function submitReview(order, { rating, comment, files }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token || !session.user?.id) throw new Error('Please sign in again to submit a review.');

  const imagePaths = await uploadReviewImages(session.user.id, order.id, files);
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(order.id)}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ rating, comment, imagePaths }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.message || 'Could not submit your review.');
    return result.data;
  } catch (error) {
    if (imagePaths.length) await supabase.storage.from(REVIEW_IMAGES_BUCKET).remove(imagePaths);
    throw error;
  }
}

export async function getReviewedOrderIds() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return [];

  const response = await fetch(`${API_BASE_URL}/orders/reviews`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const result = await response.json().catch(() => ({}));
  return response.ok && result.success ? result.data || [] : [];
}

export async function getOrderReview(orderId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/review`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const result = await response.json().catch(() => ({}));
  return response.ok && result.success ? result.data || null : null;
}
