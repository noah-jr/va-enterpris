import { Router } from 'express';
import { SubscriptionPlanController, SubscriptionRequestController } from '../controllers/SubscriptionManagementController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { uploadProof } from '../lib/uploadProof';

const router = Router();

// ── Planos (leitura pública após auth, escrita só super admin) ─────────────
router.get('/plans',         SubscriptionPlanController.list);
router.get('/plans/all',     rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionPlanController.listAll);
router.post('/plans',        rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionPlanController.create);
router.put('/plans/:id',     rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionPlanController.update);
router.delete('/plans/:id',  rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionPlanController.remove);

// ── Pedidos de subscrição (cliente) ────────────────────────────────────────
router.post('/requests',              uploadProof, SubscriptionRequestController.requestSub);
router.get('/requests/mine',          SubscriptionRequestController.mine);
router.get('/requests/notifications', SubscriptionRequestController.notifications);
router.patch('/requests/notifications/read', SubscriptionRequestController.markRead);

// ── Pedidos de subscrição (super admin) ────────────────────────────────────
router.get('/requests',                          rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionRequestController.listAll);
router.post('/requests/:id/approve',             rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionRequestController.approve);
router.post('/requests/:id/reject',              rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionRequestController.reject);
router.post('/companies/:companyId/cancel',      rbacMiddleware([], ['SUPER_ADMIN']), SubscriptionRequestController.adminCancel);

export { router as subscriptionMgmtRoutes };
