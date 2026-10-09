import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { TreasuryController } from '../controllers/TreasuryController';

const router = Router();
router.use(authMiddleware);

router.get('/summary', rbacMiddleware(['treasury:view']), TreasuryController.getSummary);
router.get('/', rbacMiddleware(['treasury:view']), TreasuryController.listEntries);
router.post('/', rbacMiddleware(['finance:view']), TreasuryController.createEntry);
router.patch('/:id', rbacMiddleware(['finance:view']), TreasuryController.updateEntry);
router.delete('/:id', rbacMiddleware(['finance:view']), TreasuryController.deleteEntry);
router.patch('/:id/pay', rbacMiddleware(['finance:view']), TreasuryController.markPaid);

export { router as treasuryRoutes };
