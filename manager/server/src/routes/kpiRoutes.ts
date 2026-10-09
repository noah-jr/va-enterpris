import { Router } from 'express';
import { KPIController } from '../controllers/KPIController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['analytics:view']), KPIController.getKPIs);
router.post('/', rbacMiddleware(['analytics:manage']), KPIController.createKPI);
router.patch('/:id', rbacMiddleware(['analytics:manage']), KPIController.updateKPI);

export { router as kpiRoutes };
