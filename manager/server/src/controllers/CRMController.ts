import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class CRMController {
    static async getPipeline(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const clients = await prisma.client.findMany({
                where: { companyId },
                include: {
                    invoices: {
                        where: { status: { not: 'PAID' } },
                        select: { totalAmount: true, status: true, type: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            const leads = clients.map((c: any) => {
                const pipeline = c.invoices.reduce((acc: number, inv: any) => acc + (Number(inv.totalAmount) || 0), 0);
                
                let stage = 'PROSPECTION';
                if (c.invoices.some((i: any) => i.status === 'FINAL')) stage = 'NEGOTIATION';
                else if (c.invoices.some((i: any) => i.status === 'DRAFT' || i.type === 'PP')) stage = 'PROPOSAL';
                else if (pipeline > 0) stage = 'QUALIFIED';

                const probability = stage === 'NEGOTIATION' ? 75 : stage === 'PROPOSAL' ? 50 : stage === 'QUALIFIED' ? 25 : 10;
                const status = probability >= 60 ? 'HOT' : (probability >= 30 ? 'WARM' : 'COLD');

                return {
                    id: c.id,
                    name: c.name,
                    company: c.address || 'Institucional',
                    contact: c.phone || '',
                    email: c.email || '',
                    value: pipeline,
                    stage,
                    probability,
                    status
                };
            }); // Removido o filtro de .filter(l => l.value > 0...) para mostrar prospecções vazias

            const totalPipeline = leads.reduce((acc: number, l: any) => acc + l.value, 0);
            const avgTicket = leads.length > 0 ? totalPipeline / leads.length : 0;
            const hotLeads = leads.filter((l: any) => l.status === 'HOT').length;

            const activity = await prisma.auditLog.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { user: { select: { name: true } } }
            });

            res.json({ leads, totalPipeline, avgTicket, hotLeads, activity });
        } catch (error) {
            console.error('[CRM Error]', error);
            res.status(500).json({ error: 'Erro ao carregar pipeline CRM' });
        }
    }

    static async createLead(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { name, company, value, contact, email } = req.body;

            const client = await prisma.client.create({
                data: {
                    companyId,
                    name,
                    nif: '999999999',
                    phone: contact,
                    email,
                    address: company || 'OPORTUNIDADE CRM',
                }
            });

            if (value && Number(value) > 0) {
                await prisma.invoice.create({
                    data: {
                        companyId,
                        clientId: client.id,
                        type: 'PP',
                        number: `ORC-${Date.now().toString().slice(-6)}`,
                        status: 'DRAFT',
                        totalAmount: Number(value),
                        totalVat: Number(value) * 0.14,
                        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                        issueDate: new Date()
                    }
                });
            }

            res.status(201).json(client);
        } catch (error) {
            console.error('[CRM Create Error]', error);
            res.status(500).json({ error: 'Erro ao criar oportunidade comercial' });
        }
    }
}
