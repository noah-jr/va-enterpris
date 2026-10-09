import { Router } from 'express';
import { RiskController } from '../controllers/RiskController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['risks:view']), RiskController.getRisks);
router.post('/', rbacMiddleware(['risks:manage']), RiskController.createRisk);
router.patch('/:id', rbacMiddleware(['risks:manage']), RiskController.updateRisk);
router.delete('/:id', rbacMiddleware(['risks:manage']), RiskController.deleteRisk);

export { router as riskRoutes };
