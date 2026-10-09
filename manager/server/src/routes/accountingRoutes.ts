// accountingRoutes.ts
import { Router } from 'express';
import { AccountingController } from '../controllers/AccountingController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbacMiddleware(['finance:view']), AccountingController.listEntries);
router.get('/summary', rbacMiddleware(['finance:view']), AccountingController.getSummary);
router.post('/', rbacMiddleware(['finance:create']), AccountingController.createEntry);
router.patch('/:id', rbacMiddleware(['finance:update']), AccountingController.updateEntry);
router.delete('/:id', rbacMiddleware(['finance:delete']), AccountingController.deleteEntry);

export { router as accountingRoutes };
