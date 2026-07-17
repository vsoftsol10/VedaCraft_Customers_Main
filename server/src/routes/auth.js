/**
 * Auth Routes - /api/v1/auth
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { randomInt } from 'crypto';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { sendLoginOtpEmail } from '../services/emailService.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();
const emailOtpStore = new Map();
const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;

const emailOtpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    message: 'Too many OTP requests. Please wait a minute before trying again.',
  },
});

const generateSixDigitOtp = () => String(randomInt(100000, 1000000));

// GET /api/v1/auth/status - simple health check for auth route
router.get('/status', (_req, res) => {
  res.json({ success: true, message: 'Auth route is active' });
});

// POST /api/v1/auth/email-otp - generate a Supabase link token and send our 6-digit OTP
router.post('/email-otp', emailOtpLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Enter a valid email address',
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: 'Supabase admin client is not configured',
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (error) {
      throw error;
    }

    const hashedToken = data?.properties?.hashed_token;

    if (!hashedToken) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: 'Unable to generate email OTP',
      });
    }

    const otp = generateSixDigitOtp();
    emailOtpStore.set(email, {
      otp,
      hashedToken,
      expiresAt: Date.now() + EMAIL_OTP_TTL_MS,
    });

    await sendLoginOtpEmail({ email, otp });

    return sendSuccess(res, null, 'OTP sent to email');
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email-otp', emailOtpLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Enter a valid email and 6-digit OTP',
      });
    }

    const storedOtp = emailOtpStore.get(email);

    if (!storedOtp || storedOtp.expiresAt < Date.now()) {
      emailOtpStore.delete(email);
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'OTP expired. Please request a new code.',
      });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Invalid OTP',
      });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: storedOtp.hashedToken,
      type: 'magiclink',
    });

    if (error) {
      throw error;
    }

    emailOtpStore.delete(email);

    return sendSuccess(res, data?.session || null, 'OTP verified');
  } catch (error) {
    next(error);
  }
});

export default router;
