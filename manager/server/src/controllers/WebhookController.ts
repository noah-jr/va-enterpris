import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuditService } from '../services/AuditService';
import { SaasService } from '../services/SaasService';


export class WebhookController {
    /**
     * Webhook to receive payment confirmations
     * In a real world, this would verify a signature header (e.g., Stripe, Proxypay)
     */
    static async handlePaymentWebhook(req: Request, res: Response) {
        try {
            // Expected payload from the payment provider mock
            const { event, data } = req.body;

            // Simple security check (api key or secret)
            const webhookSecret = req.headers['x-webhook-secret'];
            if (webhookSecret !== (process.env.WEBHOOK_SECRET || 'va_secret_webhook_123')) {
                return res.status(401).json({ error: 'Unauthorized webhook request' });
            }

            if (event === 'payment.succeeded') {
                const { companyId, planId, billing } = data;
                
                // Process both subscription activation and platform billing/invoice generation
                const result = await SaasService.processSubscriptionPayment(companyId, planId, billing || 'MONTHLY');

                console.log(`[Webhook] Payment successful. Internal Invoice generated: ${result.invoice.number}`);
                return res.status(200).json({ received: true, success: true, invoiceNumber: result.invoice.number });
            }

            return res.status(200).json({ received: true, message: 'Unhandled event type' });
        } catch (error: any) {
            console.error('[Webhook Error]', error);
            return res.status(500).json({ error: error.message || 'Webhook processing failed' });
        }
    }

    /**
     * Simula o comportamento do gateway de pagamento
     */
    static async simulatePayment(req: Request, res: Response) {
        try {
            const { companyId, planId, billing } = req.body;
            if (!companyId || !planId) return res.status(400).json({ error: 'Company and plan are required' });

            // Direct call to SaaS service (simulating what the webhook would do after verify)
            const result = await SaasService.processSubscriptionPayment(companyId, planId, billing || 'ANNUAL');
            
            res.json({
                message: 'Simulação de Pagamento: SUCESSO',
                details: `Plano ${planId} activo. Factura VA-ONEGEST: ${result.invoice.number}`,
                invoice: result.invoice
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
