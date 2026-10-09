import { Router } from 'express';
import { CheckInController } from '../../../adapters/controllers/CheckInController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const checkInController = new CheckInController();

router.post('/',
    authMiddleware,
    roleMiddleware(['ADMIN', 'ORGANIZADOR']),
    (req, res) => checkInController.handle(req, res)
);

export default router;
