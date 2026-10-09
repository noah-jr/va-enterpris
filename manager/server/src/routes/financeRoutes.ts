import { Router } from 'express';
import { FinanceController } from '../controllers/FinanceController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/summary', rbacMiddleware(['finance:view']), FinanceController.getSummary);
router.get('/', rbacMiddleware(['finance:view']), FinanceController.getEntries);
router.post('/', rbacMiddleware(['finance:create']), FinanceController.createEntry);
router.patch('/reconcile', rbacMiddleware(['finance:update']), FinanceController.reconcile);
router.patch('/:id', rbacMiddleware(['finance:update']), FinanceController.updateEntry);
router.patch('/:id/pay', rbacMiddleware(['finance:update']), FinanceController.markAsPaid);
router.delete('/:id', rbacMiddleware(['finance:delete']), FinanceController.deleteEntry);

router.get('/bank-accounts', rbacMiddleware(['finance:view']), FinanceController.getBankAccounts);
router.post('/bank-accounts', rbacMiddleware(['finance:create']), FinanceController.createBankAccount);
router.patch('/bank-accounts/:id', rbacMiddleware(['finance:update']), FinanceController.updateBankAccount);
router.delete('/bank-accounts/:id', rbacMiddleware(['finance:delete']), FinanceController.deleteBankAccount);

export { router as financeRoutes };
