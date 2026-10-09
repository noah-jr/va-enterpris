import { Router } from 'express';
import { EventController } from '../../../adapters/controllers/EventController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const eventController = new EventController();

router.get('/', (req, res) => eventController.getAll(req, res));
router.get('/:id', (req, res) => eventController.getById(req, res));

// Protected routes (Admin or Organizador)
router.post('/',
    authMiddleware,
    roleMiddleware(['ADMIN', 'ORGANIZADOR']),
    (req, res) => eventController.create(req, res)
);

export default router;
