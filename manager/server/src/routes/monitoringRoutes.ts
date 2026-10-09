import { Router } from 'express';
import { MonitoringController } from '../controllers/MonitoringController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

// Apenas SuperAdmin pode aceder à monitorização global do sistema
router.get('/', authMiddleware, rbacMiddleware([], ['SUPER_ADMIN']), MonitoringController.getSystemStatus);

export { router as monitoringRoutes };
