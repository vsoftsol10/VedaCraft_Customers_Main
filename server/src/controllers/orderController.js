import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import {
  decrementStockForItems,
  restoreStockForItems,
} from '../services/inventoryService.js';
import { createOrderNotification } from '../services/notificationService.js';

const getUserId = (req) => req.user?.id || 'guest';
const getUserEmail = (req) => req.user?.email || '';
const getUserName = (req) =>
  req.user?.user_metadata?.full_name || req.user?.email?.split('@')[0] || '';
const SHIPPED_STATUSES = new Set(['Shipped', 'In Transit', 'Out for Delivery', 'Delivered']);

const ORDER_STATUS_NOTIFICATION_COPY = {
  Paid: {
    title: 'Payment Confirmed',
    message: 'Your payment was successful and your order is being prepared.',
  },
  Shipped: {
    title: 'Order Shipped',
    message: 'Your order has been shipped and is on the way.',
  },
  'In Transit': {
    title: 'Order In Transit',
    message: 'Your order is moving through the delivery network.',
  },
  'Out for Delivery': {
    title: 'Out for Delivery',
    message: 'Your order is out for delivery and should reach you soon.',
  },
  Delivered: {
    title: 'Order Delivered',
    message: 'Your order has been delivered successfully.',
  },
  Cancelled: {
    title: 'Order Cancelled',
    message: 'Your order has been cancelled.',
  },
  'Return Requested': {
    title: 'Return Requested',
    message: 'Your return request has been submitted.',
  },
};

const getOrderStatusNotificationCopy = (status) =>
  ORDER_STATUS_NOTIFICATION_COPY[status] || {
    title: 'Order Status Updated',
    message: `Your order status changed to ${status}.`,
  };

export const getOrders = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!supabaseAdmin) {
      return sendSuccess(res, [], 'Orders retrieved successfully');
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, data || [], 'Orders retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const userId = getUserId(req);
    const userEmail = getUserEmail(req);
    const userName = getUserName(req);
    const items = payload.items || [];

    if (!supabaseAdmin) {
      const mockOrder = {
        id: `local-${Date.now()}`,
        user_id: userId,
        ...payload,
      };

      if (userEmail) {
        sendOrderConfirmationEmail({
          email: userEmail,
          name: userName,
          orderId: mockOrder.id,
          items,
          total: Number(payload.total || 0),
          address: payload.address || null,
        }).catch((err) => console.error('Background email error:', err));
      }

      return sendSuccess(res, mockOrder, 'Order created successfully', 201);
    }

    await decrementStockForItems(items);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: userId,
          status: payload.status || 'Placed',
          payment_method: payload.paymentMethod || 'Cash on Delivery',
          total: Number(payload.total || 0),
          item_count: Number(payload.itemCount || 0),
          product: payload.product || 'Vedha Craft Order',
          items,
          address: payload.address || null,
        },
      ])
      .select()
      .single();

    if (error) {
      await restoreStockForItems(items);
      throw error;
    }

    if (userEmail) {
      sendOrderConfirmationEmail({
        email: userEmail,
        name: userName,
        orderId: data.id,
        items: data.items || [],
        total: data.total,
        address: data.address || null,
      }).catch((err) => console.error('Background email error:', err));
    }

    createOrderNotification({
      userId,
      orderId: data.id,
      title: 'Order Placed!',
      message: `Your order for Rs.${data.total} has been placed successfully.`,
    }).catch((err) => console.error('Notification error:', err));

    return sendSuccess(res, data, 'Order created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { status } = req.body || {};

    if (!status || typeof status !== 'string') {
      return sendError(res, 400, 'Order status is required');
    }

    if (!supabaseAdmin) {
      return sendError(res, 503, 'Order updates are unavailable without database access');
    }

    const { data: order, error: lookupError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();

    if (lookupError || !order) {
      return sendError(res, 404, 'Order not found');
    }

    const previousStatus = order.status || 'Placed';
    const isCancelling = status === 'Cancelled' && previousStatus !== 'Cancelled';
    const isAlreadyShipped = SHIPPED_STATUSES.has(previousStatus);

    if (isCancelling && isAlreadyShipped) {
      return sendError(res, 400, 'Order cannot be cancelled after it has shipped');
    }

    const nowIso = new Date().toISOString();
    const updatePayload = {
      status,
      updated_at: nowIso,
    };

    if (status === 'Delivered') {
      updatePayload.delivered_at = order.delivered_at || nowIso;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (isCancelling) {
      await restoreStockForItems(order.items || []);
    }

    if (status !== previousStatus) {
      const copy = getOrderStatusNotificationCopy(status);
      createOrderNotification({
        userId,
        orderId: data.id,
        title: copy.title,
        message: copy.message,
      }).catch((err) => console.error('Notification error:', err));
    }

    return sendSuccess(res, data, 'Order status updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const createReturnRequest = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const orderId = req.params.id;
    const payload = req.body || {};
    const reasons = Array.isArray(payload.reasons)
      ? payload.reasons.filter((reason) => typeof reason === 'string' && reason.trim())
      : [];
    const reason = typeof payload.reason === 'string' ? payload.reason.trim() : reasons.join(', ');
    const returnMethod = payload.returnMethod === 'dropoff' ? 'dropoff' : 'pickup';
    const issueDescription =
      typeof payload.issueDescription === 'string' ? payload.issueDescription.trim() : '';

    if (!reason && reasons.length === 0) {
      return sendError(res, 400, 'Return reason is required');
    }

    if (!issueDescription) {
      return sendError(res, 400, 'Issue description is required');
    }

    if (!supabaseAdmin) {
      return sendError(res, 503, 'Return requests are unavailable without database access');
    }

    const { data: order, error: lookupError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (lookupError || !order) {
      return sendError(res, 404, 'Order not found');
    }

    if (order.status !== 'Delivered') {
      return sendError(res, 400, 'Only delivered orders can be returned');
    }

    const { data: existingRequest, error: existingError } = await supabaseAdmin
      .from('return_requests')
      .select('id')
      .eq('order_id', order.id)
      .eq('user_id', userId)
      .neq('status', 'Rejected')
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingRequest) {
      return sendError(res, 409, 'A return request already exists for this order');
    }

    const nowIso = new Date().toISOString();
    const returnRequestPayload = {
      order_id: order.id,
      user_id: userId,
      status: 'Requested',
      reasons,
      reason: reason || reasons.join(', '),
      return_method: returnMethod,
      pickup_address: payload.pickupAddress || order.address || null,
      is_original_condition: Boolean(payload.isOriginalCondition),
      has_original_packaging: Boolean(payload.hasOriginalPackaging),
      issue_description: issueDescription,
      items: Array.isArray(payload.items) ? payload.items : order.items || [],
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data: returnRequest, error: insertError } = await supabaseAdmin
      .from('return_requests')
      .insert([returnRequestPayload])
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Return Requested',
        updated_at: nowIso,
      })
      .eq('id', order.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    createOrderNotification({
      userId,
      orderId: updatedOrder.id,
      title: 'Return Requested',
      message: 'Your return request has been submitted.',
    }).catch((err) => console.error('Notification error:', err));

    return sendSuccess(
      res,
      {
        order: updatedOrder,
        returnRequest,
      },
      'Return request submitted successfully',
      201
    );
  } catch (error) {
    return next(error);
  }
};
