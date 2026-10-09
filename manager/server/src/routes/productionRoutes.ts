import { Router } from 'express';
import { ProductionController } from '../controllers/ProductionController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/orders', rbacMiddleware(['production:view']), ProductionController.getOrders);
router.post('/orders', rbacMiddleware(['production:manage']), ProductionController.createOrder);
router.patch('/orders/:id', rbacMiddleware(['production:manage']), ProductionController.updateOrder);
router.delete('/orders/:id', rbacMiddleware(['production:manage']), ProductionController.deleteOrder);
router.get('/lines', rbacMiddleware(['production:view']), ProductionController.getLines);
router.get('/maintenance', rbacMiddleware(['production:view']), ProductionController.getMaintenanceRecords);

export { router as productionRoutes };
