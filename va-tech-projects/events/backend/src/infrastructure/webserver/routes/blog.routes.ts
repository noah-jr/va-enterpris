import { Router } from 'express';
import { BlogController } from '../../../adapters/controllers/BlogController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const blogController = new BlogController();

router.get('/', (req, res) => blogController.getAll(req, res));
router.get('/:id', (req, res) => blogController.getById(req, res));

// Protected Admin routes
router.post('/',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    (req, res) => blogController.create(req, res)
);

// Protected Client/Admin routes for comments
router.post('/:id/comments',
    authMiddleware,
    (req, res) => blogController.addComment(req, res)
);

export default router;
