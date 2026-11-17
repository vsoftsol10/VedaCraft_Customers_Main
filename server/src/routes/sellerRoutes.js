import { Router } from 'express';
import { randomInt } from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { getDb } from '../config/db.js';
import { sendSellerWelcomeEmail } from '../services/emailService.js';

const router = Router();

// Generate temporary password: Veda@XXXX
const generateTemporaryPassword = () => `Veda@${randomInt(1000, 9999)}`;

/**
 * POST /api/v1/seller/complete-registration
 * Triggered after seller finishes onboarding submission.
 * Automatically inserts into seller_credentials with crypt hash,
 * sets status to approved, and emails credentials via Brevo.
 */
router.post('/complete-registration', async (req, res, next) => {
  try {
    const { userId, businessEmail, email, fullName, storeName } = req.body || {};
    const targetEmail = String(businessEmail || email || '').trim().toLowerCase();

    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required for seller registration.',
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    let sellerCode = null;
    let applicationId = null;

    // 1. Fetch application ID from seller_applications
    const db = getDb();
    if (userId) {
      const appResult = await db.query(
        'SELECT id, store_name, full_name, business_email FROM public.seller_applications WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      if (appResult.rows.length) {
        applicationId = appResult.rows[0].id;
      }
    }

    if (!applicationId && targetEmail) {
      const appResult = await db.query(
        'SELECT id, store_name, full_name, business_email FROM public.seller_applications WHERE LOWER(business_email) = $1 LIMIT 1',
        [targetEmail]
      );
      if (appResult.rows.length) {
        applicationId = appResult.rows[0].id;
      }
    }

    // 2. Insert or update seller_credentials in PostgreSQL using pgp_sym_encrypt
    const encryptionKey = process.env.SELLER_PASSWORD_ENCRYPTION_KEY || 'vedacrafts-dev-key-2026';
    if (applicationId) {
      const credResult = await db.query(
        `INSERT INTO public.seller_credentials (application_id, username, encrypted_password)
         VALUES ($1, $2, pgp_sym_encrypt($3, $4))
         ON CONFLICT (application_id) DO UPDATE
         SET encrypted_password = pgp_sym_encrypt($3, $4),
             username = $2,
             updated_at = now()
         RETURNING seller_code`,
        [applicationId, targetEmail, temporaryPassword, encryptionKey]
      );

      if (credResult.rows.length) {
        sellerCode = credResult.rows[0].seller_code;
      }

      // Update seller_applications status to approved and active
      await db.query(
        `UPDATE public.seller_applications
         SET status = 'approved', is_selling_active = true, updated_at = now()
         WHERE id = $1`,
        [applicationId]
      );
    }

    // Fallback code if not generated from sequence
    if (!sellerCode) {
      sellerCode = `VSELL-${randomInt(100, 999)}`;
    }

    // 3. Update Supabase Auth user password if userId is provided
    if (supabaseAdmin && userId) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: temporaryPassword,
        });
      } catch (authErr) {
        console.warn('[SellerRoutes] Notice updating Supabase Auth password:', authErr.message);
      }
    }

    // 4. Send credentials to Seller's email via Brevo
    let emailSent = false;
    let emailError = null;
    try {
      await sendSellerWelcomeEmail({
        email: targetEmail,
        sellerName: fullName || storeName,
        storeName: storeName,
        sellerCode,
        temporaryPassword,
        loginUrl: `${req.headers.origin || 'http://localhost:5173'}/seller`,
      });
      emailSent = true;
    } catch (err) {
      console.error('[SellerRoutes] Brevo email dispatch error:', err.message);
      emailError = err.message;
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? 'Seller registration completed! Credentials have been sent to your email.'
        : 'Seller registration completed! (Email notification pending)',
      data: {
        sellerCode,
        email: targetEmail,
        temporaryPassword,
        emailSent,
        emailError: emailSent ? undefined : emailError,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
