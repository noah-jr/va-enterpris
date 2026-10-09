import { Router } from 'express';
import { MarketingController } from '../controllers/MarketingController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['marketing:view']), MarketingController.getCampaigns);
router.post('/', rbacMiddleware(['marketing:view']), MarketingController.createCampaign);
router.put('/:id', rbacMiddleware(['marketing:view']), MarketingController.updateCampaign);
router.delete('/:id', rbacMiddleware(['marketing:view']), MarketingController.deleteCampaign);

export { router as marketingRoutes };
