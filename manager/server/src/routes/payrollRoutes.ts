import { Router } from 'express';
import { PayrollController } from '../controllers/PayrollController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbacMiddleware(['payroll:view']), PayrollController.getPayrolls);
router.post('/process', rbacMiddleware(['payroll:manage']), PayrollController.processPayroll);
router.patch('/:id/pay', rbacMiddleware(['payroll:manage']), PayrollController.markPaid);

export { router as payrollRoutes };
