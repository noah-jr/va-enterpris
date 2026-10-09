import { Router } from 'express';
import { NewsletterController } from '../../../adapters/controllers/NewsletterController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const newsletterController = new NewsletterController();

router.post('/subscribe', (req, res) => newsletterController.subscribe(req, res));
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => newsletterController.getAll(req, res));

export default router;
