import { Router } from 'express';
import { FleetController } from '../controllers/FleetController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbacMiddleware(['fleet:view']), FleetController.getVehicles);
router.post('/', rbacMiddleware(['fleet:view']), FleetController.createVehicle);
router.get('/fuel', rbacMiddleware(['fleet:view']), FleetController.getFuelRecords);
router.post('/fuel', rbacMiddleware(['fleet:view']), FleetController.addFuelRecord);

export { router as fleetRoutes };
