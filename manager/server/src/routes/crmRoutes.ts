import { Router } from 'express';
import { CRMController } from '../controllers/CRMController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/pipeline', rbacMiddleware(['crm:view']), CRMController.getPipeline);
router.post('/leads', rbacMiddleware(['crm:view']), CRMController.createLead);

export { router as crmRoutes };
