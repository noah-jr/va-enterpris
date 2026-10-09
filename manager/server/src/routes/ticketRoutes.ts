import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// ── Tickets (protegidos — requerem auth via /api) ──────────────────────────
router.get('/',          TicketController.list);
router.post('/',         TicketController.create);
router.get('/:id',       TicketController.getOne);
router.post('/:id/reply',TicketController.reply);
router.patch('/:id/status', rbacMiddleware([], ['SUPER_ADMIN', 'ADMIN']), TicketController.updateStatus);

// ── Admin only ─────────────────────────────────────────────────────────────
router.get('/admin/contacts',    rbacMiddleware([], ['SUPER_ADMIN']), TicketController.listContacts);
router.get('/admin/subscribers', rbacMiddleware([], ['SUPER_ADMIN']), TicketController.listSubscribers);

export { router as ticketRoutes };
