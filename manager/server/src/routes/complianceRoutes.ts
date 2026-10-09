import { Router } from 'express';
import { ComplianceController } from '../controllers/ComplianceController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['compliance:view', 'legal:view']), ComplianceController.getQuality);
router.get('/incidents', rbacMiddleware(['compliance:view', 'legal:view']), ComplianceController.getIncidents);
router.post('/incidents', rbacMiddleware(['compliance:view', 'legal:view']), ComplianceController.createIncident);
router.get('/stats', rbacMiddleware(['compliance:view', 'legal:view']), ComplianceController.getHSESats);
router.get('/inspections', rbacMiddleware(['compliance:view', 'legal:view']), ComplianceController.getInspections);
router.get('/expenses', rbacMiddleware(['finance:view']), ComplianceController.getExpenses);
router.post('/expenses', rbacMiddleware(['finance:view']), ComplianceController.createExpense);
router.patch('/expenses/:id', rbacMiddleware(['finance:view']), ComplianceController.updateExpense);
router.delete('/expenses/:id', rbacMiddleware(['finance:view']), ComplianceController.deleteExpense);

export { router as complianceRoutes };
