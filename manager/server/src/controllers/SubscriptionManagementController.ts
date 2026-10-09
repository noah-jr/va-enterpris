import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cloudinary } from '../lib/uploadProof';
import { EmailService } from '../services/EmailService';
import { InvoiceModel } from '../models/InvoiceModel';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BILLING_DURATION: Record<string, number> = {
    HOURLY:      1 / 24,
    DAILY:       1,
    WEEKLY:      7,
    BIWEEKLY:    14,
    MONTHLY:     30,
    QUARTERLY:   90,
    SEMIANNUAL:  180,
    ANNUAL:      365,
};

function calcEndDate(billing: string): Date {
    const days = BILLING_DURATION[billing] ?? 30;
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    return d;
}

function getPlanPrice(plan: any, billing: string): number {
    const map: Record<string, string> = {
        HOURLY:     'priceHourly',
        DAILY:      'priceDaily',
        WEEKLY:     'priceWeekly',
        BIWEEKLY:   'priceBiweekly',
        MONTHLY:    'priceMonthly',
        QUARTERLY:  'priceQuarterly',
        SEMIANNUAL: 'priceSemiannual',
        ANNUAL:     'priceAnnual',
    };
    return plan[map[billing] ?? 'priceMonthly'] ?? plan.price ?? 0;
}

async function notifyCompany(
    companyId: string,
    type: string,
    title: string,
    body: string,
    meta?: object,
) {
    await prisma.appNotification.create({
        data: { companyId, type, title, body, meta: meta ? JSON.stringify(meta) : undefined },
    });
}

// ─── SubscriptionPlanController ───────────────────────────────────────────────

export class SubscriptionPlanController {

    /** GET /api/sub/plans  — público após auth */
    static async list(_req: Request, res: Response) {
        try {
            const plans = await prisma.subscriptionPlan.findMany({
                where: { isActive: true },
                orderBy: { priceMonthly: 'asc' },
            });
            res.json(plans);
        } catch { res.status(500).json({ error: 'Erro ao listar planos.' }); }
    }

    /** GET /api/sub/plans/all  — admin: inclui inativos */
    static async listAll(_req: Request, res: Response) {
        try {
            const plans = await prisma.subscriptionPlan.findMany({ orderBy: { priceMonthly: 'asc' } });
            res.json(plans);
        } catch { res.status(500).json({ error: 'Erro ao listar planos.' }); }
    }

    /** POST /api/sub/plans  — super admin */
    static async create(req: Request, res: Response) {
        try {
            const {
                name, subtitle, maxUsers, color, popular,
                priceHourly, priceDaily, priceWeekly, priceBiweekly,
                priceMonthly, priceQuarterly, priceSemiannual, priceAnnual,
                features, modules,
            } = req.body;

            const plan = await prisma.subscriptionPlan.create({
                data: {
                    name, subtitle, maxUsers: Number(maxUsers) || 0,
                    color: color as string | undefined,
                    popular: Boolean(popular),
                    priceHourly:    Number(priceHourly)    || 0,
                    priceDaily:     Number(priceDaily)     || 0,
                    priceWeekly:    Number(priceWeekly)    || 0,
                    priceBiweekly:  Number(priceBiweekly)  || 0,
                    priceMonthly:   Number(priceMonthly)   || 0,
                    priceQuarterly: Number(priceQuarterly) || 0,
                    priceSemiannual:Number(priceSemiannual)|| 0,
                    priceAnnual:    Number(priceAnnual)    || 0,
                    price:          Number(priceMonthly)   || 0,
                    annualPrice:    Number(priceAnnual)    || 0,
                    features: Array.isArray(features) ? features : [],
                    modules:  Array.isArray(modules)  ? modules  : [],
                },
            });
            res.status(201).json(plan);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Erro ao criar plano.' });
        }
    }

    /** PUT /api/sub/plans/:id  — super admin */
    static async update(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const {
                name, subtitle, maxUsers, color, popular, isActive,
                priceHourly, priceDaily, priceWeekly, priceBiweekly,
                priceMonthly, priceQuarterly, priceSemiannual, priceAnnual,
                features, modules,
            } = req.body;

            const plan = await prisma.subscriptionPlan.update({
                where: { id },
                data: {
                    ...(name      !== undefined && { name }),
                    ...(subtitle  !== undefined && { subtitle }),
                    ...(maxUsers  !== undefined && { maxUsers: Number(maxUsers) }),
                    ...(color     !== undefined && { color }),
                    ...(popular   !== undefined && { popular }),
                    ...(isActive  !== undefined && { isActive }),
                    ...(priceHourly     !== undefined && { priceHourly:     Number(priceHourly) }),
                    ...(priceDaily      !== undefined && { priceDaily:      Number(priceDaily) }),
                    ...(priceWeekly     !== undefined && { priceWeekly:     Number(priceWeekly) }),
                    ...(priceBiweekly   !== undefined && { priceBiweekly:   Number(priceBiweekly) }),
                    ...(priceMonthly    !== undefined && { priceMonthly:    Number(priceMonthly), price: Number(priceMonthly) }),
                    ...(priceQuarterly  !== undefined && { priceQuarterly:  Number(priceQuarterly) }),
                    ...(priceSemiannual !== undefined && { priceSemiannual: Number(priceSemiannual) }),
                    ...(priceAnnual     !== undefined && { priceAnnual:     Number(priceAnnual), annualPrice: Number(priceAnnual) }),
                    ...(Array.isArray(features) && { features }),
                    ...(Array.isArray(modules)  && { modules }),
                },
            });
            res.json(plan);
        } catch { res.status(500).json({ error: 'Erro ao actualizar plano.' }); }
    }

    /** DELETE /api/sub/plans/:id  — super admin (soft delete) */
    static async remove(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await prisma.subscriptionPlan.update({
                where: { id },
                data:  { isActive: false },
            });
            res.json({ ok: true });
        } catch { res.status(500).json({ error: 'Erro ao remover plano.' }); }
    }
}

// ─── SubscriptionRequestController ───────────────────────────────────────────

export class SubscriptionRequestController {

    /**
     * POST /api/sub/requests
     * Cliente solicita subscrição + faz upload do comprovativo
     */
    static async requestSub(req: Request, res: Response) {
        try {
            const companyId = req.companyId!;
            const planId    = req.body.planId  as string;
            const billing   = req.body.billing as string;
            const file      = (req as any).file;

            if (!planId || !billing) {
                return res.status(400).json({ error: 'planId e billing são obrigatórios.' });
            }

            const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
            if (!plan || !plan.isActive) return res.status(404).json({ error: 'Plano não disponível.' });

            // Cancel any previous PENDING request for this company
            await prisma.subscriptionRequest.updateMany({
                where: { companyId, status: 'PENDING' },
                data:  { status: 'CANCELLED' },
            });

            const subReq = await prisma.subscriptionRequest.create({
                data: {
                    companyId,
                    planId,
                    billing,
                    status:       'PENDING',
                    proofUrl:     file ? (file.path as string) : undefined,
                    proofPublicId: file ? (file.filename as string) : undefined,
                },
            });

            await notifyCompany(
                companyId,
                'SUB_REQUESTED',
                'Pedido de Subscrição Enviado',
                `O seu pedido para o plano "${plan.name}" (${billing}) está a aguardar aprovação.`,
                { requestId: subReq.id }
            );

            const io = (req as any).app.get('io');
            if (io) {
                io.to('super_admin').emit('sub:requested', {
                    requestId:   subReq.id,
                    companyId,
                    planName:    plan.name,
                    billing,
                    proofUrl:    subReq.proofUrl,
                });
            }

            res.status(201).json(subReq);
        } catch (e) {
            console.error('requestSub error:', e);
            res.status(500).json({ error: 'Erro ao submeter pedido de subscrição.' });
        }
    }

    /** GET /api/sub/requests/mine — client */
    static async mine(req: Request, res: Response) {
        try {
            const companyId = req.companyId!;
            const requests = await prisma.subscriptionRequest.findMany({
                where:   { companyId },
                include: { plan: true },
                orderBy: { requestedAt: 'desc' },
            });
            res.json(requests);
        } catch { res.status(500).json({ error: 'Erro ao listar pedidos.' }); }
    }

    /** GET /api/sub/requests — super admin */
    static async listAll(_req: Request, res: Response) {
        try {
            const requests = await prisma.subscriptionRequest.findMany({
                include: {
                    plan:    true,
                    company: { select: { id: true, name: true, nif: true, email: true } },
                },
                orderBy: { requestedAt: 'desc' },
            });
            res.json(requests);
        } catch { res.status(500).json({ error: 'Erro ao listar pedidos.' }); }
    }

    /** POST /api/sub/requests/:id/approve — super admin */
    static async approve(req: Request, res: Response) {
        try {
            const id         = req.params.id as string;
            const adminNote  = req.body.adminNote as string | undefined;

            const subReq = await prisma.subscriptionRequest.findUnique({
                where:   { id },
                include: { plan: true, company: true },
            });
            if (!subReq || subReq.status !== 'PENDING') {
                return res.status(400).json({ error: 'Pedido não disponível para aprovação.' });
            }

            const price   = getPlanPrice(subReq.plan, subReq.billing);
            const endDate = calcEndDate(subReq.billing);
            const PLATFORM_COMPANY_ID = 'c8b9bfce-bed1-4aa9-a665-51b13c21e438';

            const { newSub, realInvoice } = await prisma.$transaction(async (tx) => {
                await tx.subscription.updateMany({
                    where: { companyId: subReq.companyId, status: 'ACTIVE' },
                    data:  { status: 'SUPERSEDED' },
                });

                const newSubscription = await tx.subscription.create({
                    data: {
                        companyId: subReq.companyId,
                        plan:      subReq.planId,
                        billing:   subReq.billing,
                        status:    'ACTIVE',
                        startDate: new Date(),
                        endDate,
                        price,
                    },
                });

                if (subReq.plan.modules && subReq.plan.modules.length > 0) {
                    await tx.company.update({
                        where: { id: subReq.companyId },
                        data:  { enabledModules: subReq.plan.modules, status: 'ACTIVE' },
                    });
                }

                await tx.subscriptionRequest.update({
                    where: { id },
                    data:  { status: 'APPROVED', adminNote, reviewedAt: new Date() },
                });

                // Emitir Fatura na Plataforma
                const platformExists = await tx.company.findUnique({ where: { id: PLATFORM_COMPANY_ID } });
                if (!platformExists) {
                    const platformNif = process.env.PLATFORM_NIF || '999999999';
                    await tx.company.create({
                        data: { id: PLATFORM_COMPANY_ID, name: 'VA ONEGEST System', nif: platformNif, status: 'ACTIVE' }
                    });
                }

                let platformClientRecord = await tx.client.findFirst({
                    where: { companyId: PLATFORM_COMPANY_ID, nif: subReq.company.nif }
                });

                if (!platformClientRecord) {
                    platformClientRecord = await tx.client.create({
                        data: {
                            companyId: PLATFORM_COMPANY_ID,
                            name: subReq.company.name,
                            nif: subReq.company.nif,
                            email: (subReq.company as any).email || '',
                            address: (subReq.company as any).address || '',
                            phone: (subReq.company as any).phone || ''
                        }
                    });
                }

                const invoiceType = 'FR'; // Fatura-Recibo
                const nextNumber = await InvoiceModel.getNextInvoiceNumber(PLATFORM_COMPANY_ID, invoiceType, tx);
                
                const invoice = await InvoiceModel.createInvoice(
                    {
                        companyId: PLATFORM_COMPANY_ID,
                        clientId: platformClientRecord.id,
                        type: invoiceType,
                        number: nextNumber,
                        status: 'PAID',
                        totalAmount: price * 1.14,
                        totalVat: price * 0.14,
                        issueDate: new Date(),
                        dueDate: new Date(),
                    } as any,
                    [
                        {
                            productName: `Assinatura SaaS: ${subReq.plan.name}`,
                            productCode: subReq.planId,
                            quantity: 1,
                            unitPrice: price,
                            vatRate: 14,
                            totalAmount: price * 1.14,
                            description: `Período: ${new Date().toLocaleDateString()} a ${endDate.toLocaleDateString()}`
                        } as any
                    ],
                    tx
                );

                return { newSub: newSubscription, realInvoice: invoice };
            });

            await notifyCompany(
                subReq.companyId,
                'SUB_APPROVED',
                '✅ Subscrição Aprovada!',
                `O seu plano "${subReq.plan.name}" (${subReq.billing}) foi aprovado e está activo até ${endDate.toLocaleDateString('pt-PT')}. A fatura ${realInvoice.number} foi emitida.`,
                { subscriptionId: newSub.id }
            );

            // Send Email to the client company
            if (subReq.company.email) {
                await EmailService.sendSubscriptionApproval(
                    subReq.company.email,
                    subReq.company.name,
                    subReq.plan.name,
                    subReq.billing,
                    endDate.toLocaleDateString('pt-PT'),
                    price,
                    realInvoice.number
                );
            }

            const io = (req as any).app.get('io');
            if (io) {
                io.to(`company_${subReq.companyId}`).emit('sub:approved', {
                    subscriptionId: newSub.id,
                    planName:       subReq.plan.name,
                    billing:        subReq.billing,
                    endDate:        endDate.toISOString(),
                });
            }

            res.json({ ok: true, subscription: newSub });
        } catch (e) {
            console.error('approve error:', e);
            res.status(500).json({ error: 'Erro ao aprovar subscrição.' });
        }
    }

    /** POST /api/sub/requests/:id/reject — super admin */
    static async reject(req: Request, res: Response) {
        try {
            const id        = req.params.id as string;
            const adminNote = req.body.adminNote as string | undefined;

            const subReq = await prisma.subscriptionRequest.findUnique({
                where: { id }, include: { plan: true },
            });
            if (!subReq) return res.status(404).json({ error: 'Pedido não encontrado.' });

            await prisma.subscriptionRequest.update({
                where: { id },
                data:  { status: 'REJECTED', adminNote, reviewedAt: new Date() },
            });

            await notifyCompany(
                subReq.companyId,
                'SUB_REJECTED',
                'Subscrição Rejeitada',
                `O seu pedido para o plano "${subReq.plan.name}" foi rejeitado. ${adminNote ? 'Motivo: ' + adminNote : ''}`,
                { requestId: id }
            );

            const io = (req as any).app.get('io');
            if (io) {
                io.to(`company_${subReq.companyId}`).emit('sub:rejected', { requestId: id, note: adminNote });
            }

            res.json({ ok: true });
        } catch { res.status(500).json({ error: 'Erro ao rejeitar pedido.' }); }
    }

    /** POST /api/sub/companies/:companyId/cancel — super admin */
    static async adminCancel(req: Request, res: Response) {
        try {
            const companyId = req.params.companyId as string;
            const reason    = req.body.reason as string | undefined;

            const sub = await prisma.subscription.findFirst({
                where:   { companyId, status: 'ACTIVE' },
                orderBy: { startDate: 'desc' },
            });
            if (!sub) return res.status(404).json({ error: 'Nenhuma subscrição activa encontrada.' });

            await prisma.subscription.update({
                where: { id: sub.id },
                data:  { status: 'CANCELLED', endDate: new Date() },
            });

            await notifyCompany(
                companyId,
                'SUB_CANCELLED',
                'Subscrição Cancelada',
                `A sua subscrição foi cancelada administrativamente. ${reason ? 'Motivo: ' + reason : ''}`,
            );

            const io = (req as any).app.get('io');
            if (io) {
                io.to(`company_${companyId}`).emit('sub:cancelled', { reason });
            }

            res.json({ ok: true });
        } catch { res.status(500).json({ error: 'Erro ao cancelar subscrição.' }); }
    }

    /** GET /api/sub/requests/notifications */
    static async notifications(req: Request, res: Response) {
        try {
            const companyId = req.companyId!;
            const notifs = await prisma.appNotification.findMany({
                where:   { companyId },
                orderBy: { createdAt: 'desc' },
                take:    30,
            });
            res.json(notifs);
        } catch { res.status(500).json({ error: 'Erro ao listar notificações.' }); }
    }

    /** PATCH /api/sub/requests/notifications/read */
    static async markRead(req: Request, res: Response) {
        try {
            const companyId = req.companyId!;
            await prisma.appNotification.updateMany({
                where: { companyId, read: false },
                data:  { read: true },
            });
            res.json({ ok: true });
        } catch { res.status(500).json({ error: 'Erro.' }); }
    }
}
