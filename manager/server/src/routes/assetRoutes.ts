import { Router } from 'express';
import * as AssetController from '../controllers/AssetController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['assets:view']), AssetController.getAssets);
router.post('/', rbacMiddleware(['assets:manage']), AssetController.createAsset);
router.post('/:assetId/maintenance', rbacMiddleware(['assets:manage']), AssetController.createMaintenanceRecord);

export { router as assetRoutes };
