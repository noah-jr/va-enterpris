import { Router } from 'express';
import { TaxpayerController } from '../controllers/TaxpayerController';

const router = Router();

router.get('/:nif', TaxpayerController.getTaxpayerData);

export { router as taxpayerRoutes };
