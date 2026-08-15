/**
 * VedaCraft Server — Express Application
 * Configures all middleware, routes, and mounts the API router.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { corsOptions } from './config/cors.js';
import { rateLimitOptions } from './config/rateLimit.js';
import apiRouter from './routes/index.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.LOG_LEVEL || 'dev'));
}

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
app.use('/api', rateLimit(rateLimitOptions));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ─── 404 & Error Handling ────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
