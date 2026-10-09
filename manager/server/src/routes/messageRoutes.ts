import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';

const router = Router();

router.get('/', MessageController.getInbox);
// Optional: POST for creating them (normally you'd secure this to Super Admin only)
router.post('/broadcast', MessageController.createBroadcast);

export { router as messageRoutes };
