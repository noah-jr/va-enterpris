import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbacMiddleware(['suppliers:view']), SupplierController.index);
router.post('/', rbacMiddleware(['suppliers:create']), SupplierController.create);
router.put('/:id', rbacMiddleware(['suppliers:update']), SupplierController.update);
router.delete('/:id', rbacMiddleware(['suppliers:delete']), SupplierController.destroy);

export { router as supplierRoutes };
