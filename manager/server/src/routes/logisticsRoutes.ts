import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/vehicles', rbacMiddleware(['logistics:view']), LogisticsController.getVehicles);
router.post('/vehicles', rbacMiddleware(['logistics:view']), LogisticsController.createVehicle);
router.get('/transports', rbacMiddleware(['logistics:view']), LogisticsController.getTransports);
router.post('/transports', rbacMiddleware(['logistics:view']), LogisticsController.createTransport);

export { router as logisticsRoutes };
