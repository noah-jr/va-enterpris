import { Router } from 'express';
import { HRAdvancedController } from '../controllers/HRAdvancedController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

// Overview
router.get('/overview', rbacMiddleware(['employees:view']), HRAdvancedController.getOverview);

// Promoção
router.post('/employees/:id/promote', rbacMiddleware(['employees:update']), HRAdvancedController.promoteEmployee);

// Avaliação de desempenho
router.post('/employees/:id/evaluate', rbacMiddleware(['employees:update']), HRAdvancedController.evaluateEmployee);

// Processamento salarial avançado (individual)
router.post('/payroll/process', rbacMiddleware(['payroll:process']), HRAdvancedController.processPayrollAdvanced);

// Processamento em massa
router.post('/payroll/bulk', rbacMiddleware(['payroll:process']), HRAdvancedController.processBulkPayroll);

// Marcar como pago
router.patch('/payroll/:id/paid', rbacMiddleware(['payroll:process']), HRAdvancedController.markPayrollPaid);

// Histórico salarial por colaborador
router.get('/employees/:id/payrolls', rbacMiddleware(['employees:view']), HRAdvancedController.getEmployeePayrolls);

export { router as hrAdvancedRoutes };
