import { Router } from 'express';
import { ApprovalController } from '../controllers/ApprovalController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['settings:view']), ApprovalController.getRequests);
router.post('/', rbacMiddleware(['settings:view']), ApprovalController.createRequest);
router.patch('/steps/:stepId', rbacMiddleware(['settings:view']), ApprovalController.updateStep);

export { router as approvalRoutes };
