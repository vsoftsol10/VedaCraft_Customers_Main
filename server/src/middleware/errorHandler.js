/**
 * Centralized Error Handling Middleware
 *
 * Catches all errors passed via next(err) and returns a
 * consistent JSON error response. Must be registered LAST
 * in the middleware chain (4-argument signature).
 */

// eslint-disable-next-line no-unused-vars
import fs from 'fs';

const isSupabaseNetworkError = (err) => {
  const causeCode = err?.cause?.code;
  return (
    err?.name === 'AuthRetryableFetchError' ||
    err?.message === 'fetch failed' ||
    causeCode === 'ENOTFOUND' ||
    causeCode === 'ETIMEDOUT' ||
    causeCode === 'ECONNREFUSED'
  );
};

export const errorHandler = (err, req, res, next) => {
  const supabaseNetworkError = isSupabaseNetworkError(err);

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    const errDetails = {
      message: err.message,
      stack: err.stack,
      cause: err.cause
        ? {
            message: err.cause.message,
            code: err.cause.code,
            hostname: err.cause.hostname,
          }
        : undefined,
      path: req.path,
      method: req.method,
    };
    console.error('[Error]', errDetails);
    try {
      fs.writeFileSync('last_error.json', JSON.stringify(errDetails, null, 2));
    } catch (e) {}
  } else {
    // Minimal logging in production
    console.error(`[Error] ${req.method} ${req.path} — ${err.message}`);
  }

  // Determine HTTP status code
  const statusCode = supabaseNetworkError ? 503 : err.statusCode || err.status || 500;

  // Build the response payload
  const payload = {
    success: false,
    status: statusCode,
    message: supabaseNetworkError
      ? 'Unable to reach Supabase. Check SUPABASE_URL in server/.env and your network/DNS connection.'
      : err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Attach validation errors if present (e.g., from express-validator)
  if (err.errors) {
    payload.errors = err.errors;
  }

  return res.status(statusCode).json(payload);
};
