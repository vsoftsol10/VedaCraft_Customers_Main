/**
 * Rate Limiter Configuration
 * Applied globally to all /api/* routes.
 */

export const rateLimitOptions = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    status: 429,
    message: 'Too many requests. Please try again later.',
  },
  skip: () => {
    // Local development reloads several authenticated providers at once.
    // Keep the shared API limiter for deployed environments; auth routes
    // retain their own focused protection.
    return process.env.NODE_ENV !== 'production';
  },
};
