import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, SearchController.globalSearch);

export { router as searchRoutes };
