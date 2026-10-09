import { env } from './config/env';
import { logger } from './utils/logger';
import { pool, checkDatabaseConnection } from './config/database';
import app from './app';

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 EduFlow LMS API running`, { port: env.PORT, env: env.NODE_ENV, pid: process.pid });
  const ok = await checkDatabaseConnection();
  if (ok) logger.info('✅ Database connected');
  else    logger.warn('⚠️  Database not yet reachable — will retry on first request');
});

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully…`);
  server.close(async (err) => {
    if (err) { logger.error('Error closing HTTP server', { error: err.message }); process.exit(1); }
    try {
      await pool.end();
      logger.info('DB pool closed. Bye!');
      process.exit(0);
    } catch (e) {
      logger.error('Error closing pool', { error: e });
      process.exit(1);
    }
  });
  setTimeout(() => { logger.error('Force-shutdown after 30s timeout'); process.exit(1); }, 30_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  shutdown('unhandledRejection');
});
