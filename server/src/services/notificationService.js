import { supabaseAdmin, createScopedClient } from '../config/supabase.js';
import { AppError } from '../utils/apiResponse.js';

export const getNotifications = async (userId, token) => {
  const supabase = createScopedClient(token);
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new AppError(error.message, 500);
  return data || [];
};

export const markAsRead = async (userId, id, token) => {
  const supabase = createScopedClient(token);
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new AppError(error.message, 500);
  return getNotifications(userId, token);
};

export const markAllAsRead = async (userId, token) => {
  const supabase = createScopedClient(token);
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw new AppError(error.message, 500);
  return getNotifications(userId, token);
};

/**
 * Server-side helper — call this from orderController using supabaseAdmin
 * (bypasses RLS, same pattern as createOrder/updateOrderStatus).
 */
export const createOrderNotification = async ({ userId, orderId, title, message }) => {
  if (!supabaseAdmin || !userId) return;

  const { error } = await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    type: 'order',
    title,
    message,
    order_id: orderId,
  });

  if (error) console.error('Failed to create notification:', error.message);
};