import { Router } from 'express';
import { StrategyController } from '../controllers/StrategyController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/objectives', rbacMiddleware(['strategy:view']), StrategyController.getObjectives);
router.post('/objectives', rbacMiddleware(['strategy:view']), StrategyController.createObjective);
router.put('/objectives/:id', rbacMiddleware(['strategy:view']), StrategyController.updateObjective);
router.delete('/objectives/:id', rbacMiddleware(['strategy:view']), StrategyController.deleteObjective);

export { router as strategyRoutes };
