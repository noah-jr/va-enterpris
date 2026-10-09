import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/summary', rbacMiddleware(['reports:view']), ReportController.getERPSummary);
router.get('/financial-flow', rbacMiddleware(['reports:view']), ReportController.getFinancialFlow);
router.get('/dre', rbacMiddleware(['reports:view']), ReportController.getDRE);

export { router as reportRoutes };
