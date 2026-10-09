import type { FastifyInstance } from 'fastify';
import type { AuthController } from '../controllers/auth.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';

export interface AuthRoutesOptions {
  authController: AuthController;
  tokenService: ITokenService;
}

export async function authRoutes(
  fastify: FastifyInstance,
  options: AuthRoutesOptions,
): Promise<void> {
  const { authController, tokenService } = options;
  const authenticate = createAuthMiddleware(tokenService);

  // Rate limiting config for sensitive auth endpoints
  const authRateLimit = {
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '60000', 10),
  };

  // Public auth endpoints
  fastify.post(
    '/register',
    { config: { rateLimit: authRateLimit } },
    (req, rep) => authController.register(req, rep),
  );

  // Endpoints que consomem tokens (brute-force de tokens / abuso)
  const tokenRateLimit = {
    max: parseInt(process.env.RATE_LIMIT_TOKEN_MAX || '20', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_TOKEN_WINDOW_MS || '60000', 10),
  };

  fastify.post(
    '/verify-email',
    { config: { rateLimit: tokenRateLimit } },
    (req, rep) => authController.verifyEmail(req, rep),
  );

  fastify.post(
    '/set-password',
    { config: { rateLimit: tokenRateLimit } },
    (req, rep) => authController.setPassword(req, rep),
  );

  fastify.post(
    '/client/login',
    { config: { rateLimit: authRateLimit } },
    (req, rep) => authController.loginClient(req, rep),
  );

  fastify.post(
    '/user/login',
    { config: { rateLimit: authRateLimit } },
    (req, rep) => authController.loginUser(req, rep),
  );

  fastify.post(
    '/forgot-password',
    { config: { rateLimit: authRateLimit } },
    (req, rep) => authController.forgotPassword(req, rep),
  );

  fastify.post(
    '/resend-verification',
    { config: { rateLimit: authRateLimit } },
    (req, rep) => authController.resendVerification(req, rep),
  );

  // Recuperação de senha de utilizadores internos (painel admin)
  fastify.post(
    '/user/forgot-password',
    { config: { rateLimit: authRateLimit } },
    (req, rep) => authController.forgotUserPassword(req, rep),
  );

  fastify.post(
    '/user/reset-password',
    { config: { rateLimit: tokenRateLimit } },
    (req, rep) => authController.resetUserPassword(req, rep),
  );

  fastify.post(
    '/reset-password',
    { config: { rateLimit: tokenRateLimit } },
    (req, rep) => authController.resetPassword(req, rep),
  );

  fastify.post(
    '/refresh',
    { config: { rateLimit: tokenRateLimit } },
    (req, rep) => authController.refreshToken(req, rep),
  );

  fastify.post('/logout', (req, rep) => authController.logout(req, rep));

  // Protected endpoints
  fastify.get(
    '/me',
    { preHandler: [authenticate] },
    (req, rep) => authController.me(req, rep),
  );

  fastify.post(
    '/change-password',
    { preHandler: [authenticate], config: { rateLimit: authRateLimit } },
    (req, rep) => authController.changePassword(req, rep),
  );
}
