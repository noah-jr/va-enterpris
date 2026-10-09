import { Router } from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbacMiddleware(['maintenance:view']), MaintenanceController.getMaintenance);
router.post('/', rbacMiddleware(['maintenance:view']), MaintenanceController.createMaintenance);

export { router as maintenanceRoutes };
