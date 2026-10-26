import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { prisma } from './db.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Enable CORS
  await app.register(cors, {
    origin: true,
  });

  // Health Check Endpoint
  app.get('/health', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      app.log.error('Health check DB failure:', error);
      return reply.status(500).send({
        status: 'error',
        database: 'disconnected',
        error: (error as Error).message,
      });
    }
  });

  // Graceful Shutdown Handler
  const onClose = async () => {
    app.log.info('Closing database connection pool...');
    await prisma.$disconnect();
  };

  app.addHook('onClose', onClose);

  return app;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 Fastify backend listening on http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('Error starting Fastify server:', err);
    process.exit(1);
  }
}

// Execute if run directly
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  start();
}
