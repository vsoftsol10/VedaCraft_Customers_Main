import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { decrementStockForItems, restoreStockForItems } from '../services/inventoryService.js';

let razorpayInstance;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

const getUserId = (req) => req.user?.id || 'guest';
const getUserEmail = (req) => req.user?.email || '';
const getUserName = (req) => req.user?.user_metadata?.full_name || req.user?.email?.split('@')[0] || '';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 400, 'Invalid amount');
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('Razorpay credentials not configured. Returning mock order.');
      return sendSuccess(res, { id: `mock_order_${Date.now()}` }, 'Mock Order Created');
    }

    const instance = getRazorpayInstance();
    
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    
    return sendSuccess(res, { ...order, key_id: process.env.RAZORPAY_KEY_ID }, 'Razorpay order created');
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return next(error);
  }
};

export const verifyPaymentAndCreateOrder = async (req, res, next) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      address,
      paymentMethod,
      total,
      itemCount,
      product
    } = req.body;

    const userId = getUserId(req);
    const userEmail = getUserEmail(req);
    const userName = getUserName(req);

    // Verify Signature if not using mock
    if (process.env.RAZORPAY_KEY_SECRET && !razorpay_order_id.startsWith('mock_')) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return sendError(res, 400, 'Invalid payment signature');
      }
    }

    // Payment Verified, create the order in DB
    if (!supabaseAdmin) {
      const mockOrder = {
        id: `local-${Date.now()}`,
        user_id: userId,
        status: 'Paid',
        payment_method: paymentMethod,
        total: Number(total || 0),
        item_count: Number(itemCount || 0),
        product: product || 'Vedha Craft Order',
        items: items || [],
        address: address || null,
        razorpay_payment_id,
        razorpay_order_id
      };

      if (userEmail) {
        sendOrderConfirmationEmail({
          email: userEmail,
          name: userName,
          orderId: mockOrder.id,
          items: items || [],
          total: Number(total || 0),
          address: address || null,
        }).catch(err => console.error('Background email error:', err));
      }

      return sendSuccess(res, mockOrder, 'Payment verified and order created', 201);
    }

    const orderItems = items || [];

    await decrementStockForItems(orderItems);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: userId,
          status: 'Paid',
          payment_method: paymentMethod,
          total: Number(total || 0),
          item_count: Number(itemCount || 0),
          product: product || 'Vedha Craft Order',
          items: orderItems,
          address: address || null,
          // If the columns exist, we could save them:
          // razorpay_payment_id,
          // razorpay_order_id,
          // razorpay_signature
        },
      ])
      .select()
      .single();

    if (error) {
      await restoreStockForItems(orderItems);
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
      }).catch(err => console.error('Background email error:', err));
    }

    return sendSuccess(res, data, 'Payment verified and order created', 201);
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return next(error);
  }
};

