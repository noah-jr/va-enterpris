import { Router } from 'express';
import { PurchasingController } from '../controllers/PurchasingController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbacMiddleware(['purchasing:view']), PurchasingController.getOrders);
router.post('/', rbacMiddleware(['purchasing:view']), PurchasingController.createOrder);
router.patch('/:id/status', rbacMiddleware(['purchasing:view']), PurchasingController.updateStatus);

export { router as purchasingRoutes };
