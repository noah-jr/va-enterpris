import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();

// Recebe notificações de pagamentos de gateways (não precisa de auth middleware)
router.post('/payments', WebhookController.handlePaymentWebhook);
router.post('/simulate-payment', WebhookController.simulatePayment);

export { router as webhookRoutes };
