import { Router } from 'express';
import { ExpansionController } from '../controllers/ExpansionController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/markets', rbacMiddleware(['strategy:view']), ExpansionController.getMarkets);
router.post('/markets', rbacMiddleware(['strategy:manage']), ExpansionController.createMarket);
router.patch('/markets/:id', rbacMiddleware(['strategy:manage']), ExpansionController.updateMarket);
router.delete('/markets/:id', rbacMiddleware(['strategy:manage']), ExpansionController.deleteMarket);

export { router as expansionRoutes };
