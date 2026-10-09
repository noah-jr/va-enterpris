import { Router } from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', rbacMiddleware(['finance:view']), BudgetController.getBudgetLines);
router.post('/', rbacMiddleware(['finance:create']), BudgetController.createBudgetLine);
router.patch('/:id', rbacMiddleware(['finance:update']), BudgetController.updateBudgetLine);
router.delete('/:id', rbacMiddleware(['finance:delete']), BudgetController.deleteBudgetLine);

export { router as budgetRoutes };
