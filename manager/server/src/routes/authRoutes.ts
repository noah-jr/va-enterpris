import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { SystemSettingsController } from '../controllers/SystemSettingsController';

const router = Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.registerSaaS); // For SaaS Onboarding
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/plans', AuthController.getPlans);
router.get('/public-settings', SystemSettingsController.getPublicSettings);
router.get('/public-stats', AuthController.getPublicStats);

// Protected routes (require valid JWT)
router.get('/me', authMiddleware, AuthController.me);

export { router as authRoutes };
