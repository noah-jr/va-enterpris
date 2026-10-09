import { Router } from 'express';
import * as POSController from '../controllers/POSController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

// Terminals
router.get('/terminals', rbacMiddleware(['pos:view']), POSController.getTerminals);
router.post('/terminals', rbacMiddleware(['pos:view']), POSController.createTerminal);

// Sessions (Caixa)
router.post('/sessions/open', rbacMiddleware(['pos:view']), POSController.openSession);
router.post('/sessions/:id/close', rbacMiddleware(['pos:view']), POSController.closeSession);
router.get('/terminals/:terminalId/active-session', rbacMiddleware(['pos:view']), POSController.getActiveSession);

// Sales
router.get('/sales', rbacMiddleware(['pos:view']), POSController.getSales);
router.post('/sales', rbacMiddleware(['pos:view']), POSController.createSale);

// Analytics
router.get('/stats', rbacMiddleware(['pos:view']), POSController.getPOSStats);

export { router as posRoutes };
