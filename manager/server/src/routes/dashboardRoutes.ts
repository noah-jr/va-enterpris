import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['dashboard:view']), DashboardController.getOverview);

export { router as dashboardRoutes };
