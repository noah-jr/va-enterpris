import { Router } from 'express';
import { HRController } from '../controllers/HRController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

import { uploadEmployeePhoto } from '../lib/uploadEmployeePhoto';

const router = Router();
router.use(authMiddleware);

router.get('/employees', rbacMiddleware(['employees:view']), HRController.getEmployees);
router.post('/employees', rbacMiddleware(['employees:create']), uploadEmployeePhoto, HRController.createEmployee);
router.put('/employees/:id', rbacMiddleware(['employees:update']), uploadEmployeePhoto, HRController.updateEmployee);
router.delete('/employees/:id', rbacMiddleware(['employees:delete']), HRController.deleteEmployee);

export { router as hrRoutes };
