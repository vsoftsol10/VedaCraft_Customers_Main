/**
 * VedaCraft Server — Entry Point
 * Bootstraps the Express application and starts listening.
 */

import './config/env.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║        🪔 VedaCraft API Server        ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log(`  ▸ Environment : ${NODE_ENV}`);
  console.log(`  ▸ Port        : ${PORT}`);
  console.log(`  ▸ Base URL    : http://localhost:${PORT}/api/v1`);
  console.log(`  ▸ Health      : http://localhost:${PORT}/api/v1/health`);
  console.log('');
});

// Graceful shutdown on SIGTERM / SIGINT
const shutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  process.exit(1);
});

export default server;
