import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { errorHandler } from './middlewares/error-handler.middleware.js';

export async function registerPlugins(app: FastifyInstance, isDev: boolean): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy: !isDev,
  });

  const allowedOrigins = [
    process.env.APP_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
    process.env.LANDING_URL || 'http://localhost:5175',
  ];

  await app.register(cors, {
    origin: (origin, cb) => {
      // Requisições sem Origin (curl, server-to-server) não são pedidos cross-site de browser.
      // Em dev aceita também qualquer origem localhost (portas do Vite podem variar).
      const isLocalhostOrigin =
        origin !== undefined && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (!origin || allowedOrigins.includes(origin) || (isDev && isLocalhostOrigin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Origem não permitida por CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(cookie, {
    // Fora de dev/test, assertSecureEnv() garante que COOKIE_SECRET está definido.
    secret: process.env.COOKIE_SECRET || 'development-cookie-secret-min-32-chars-long',
    hook: 'onRequest',
  });

  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || '60000', 10),
  });

  await app.register(multipart, {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024,
      files: 5,
    },
  });

  app.setErrorHandler(errorHandler);
}
