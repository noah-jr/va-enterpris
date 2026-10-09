import { Router } from 'express';
import * as LegalController from '../controllers/LegalController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/contracts', rbacMiddleware(['legal:view']), LegalController.getContracts);
router.post('/contracts', rbacMiddleware(['legal:view']), LegalController.createContract);
router.patch('/contracts/:id', rbacMiddleware(['legal:view']), LegalController.updateContract);
router.delete('/contracts/:id', rbacMiddleware(['legal:view']), LegalController.deleteContract);

export { router as legalRoutes };
