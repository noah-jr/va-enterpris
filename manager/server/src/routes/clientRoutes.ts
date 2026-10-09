import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['clients:view']), ClientController.index);
router.get('/:id', rbacMiddleware(['clients:view']), ClientController.show);
router.post('/', rbacMiddleware(['clients:view']), ClientController.create);
router.put('/:id', rbacMiddleware(['clients:view']), ClientController.update);
router.delete('/:id', rbacMiddleware(['clients:view']), ClientController.destroy);

export { router as clientRoutes };
