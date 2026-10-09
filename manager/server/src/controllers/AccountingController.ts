import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * AccountingController — Módulo de Contabilidade
 */
export class AccountingController {
    static async getSummary(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const [receivables, payables, bankAccounts, invoices] = await Promise.all([
                prisma.financialEntry.aggregate({
                    where: { companyId, type: 'RECEIVABLE' },
                    _sum: { amount: true },
                    _count: true
                }),
                prisma.financialEntry.aggregate({
                    where: { companyId, type: 'PAYABLE' },
                    _sum: { amount: true },
                    _count: true
                }),
                prisma.bankAccount.aggregate({
                    where: { companyId },
                    _sum: { balance: true }
                }),
                prisma.invoice.aggregate({
                    where: { companyId },
                    _sum: { totalAmount: true, totalVat: true }
                })
            ]);

            const totalAssets = Number(bankAccounts._sum.balance) || 0;
            const totalReceivables = Number(receivables._sum.amount) || 0;
            const totalPayables = Number(payables._sum.amount) || 0;

            res.json({
                totalAssets,
                totalReceivables,
                totalPayables,
                totalInvoiced: Number(invoices._sum.totalAmount) || 0,
                totalVat: Number(invoices._sum.totalVat) || 0,
                netPosition: totalAssets + totalReceivables - totalPayables,
                receivablesCount: receivables._count,
                payablesCount: payables._count,
            });
        } catch (error) {
            console.error('[AccountingSummary Error]', error);
            res.status(500).json({ error: 'Erro ao obter resumo contabilístico' });
        }
    }

    static async listEntries(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const entries = await prisma.financialEntry.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 200
            });
            res.json(entries);
        } catch (error) {
            console.error('[AccountingEntries Error]', error);
            res.status(500).json({ error: 'Erro ao listar registos contabilísticos' });
        }
    }

    static async createEntry(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const { description, amount, type, category, dueDate, status } = req.body;
            const entry = await prisma.financialEntry.create({
                data: {
                    companyId,
                    description,
                    amount: Number(amount),
                    type,
                    category: category || 'OPERATIONAL',
                    dueDate: dueDate ? new Date(dueDate) : new Date(),
                    status: status || 'PENDING',
                }
            });
            res.status(201).json(entry);
        } catch (error) {
            console.error('[AccountingCreate Error]', error);
            res.status(500).json({ error: 'Erro ao criar lançamento contabilístico' });
        }
    }

    static async updateEntry(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const existing = await prisma.financialEntry.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Registo não encontrado' });

            const entry = await prisma.financialEntry.update({
                where: { id: id as string },
                data: req.body
            });
            res.json(entry);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao actualizar lançamento' });
        }
    }

    static async deleteEntry(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const existing = await prisma.financialEntry.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Registo não encontrado' });

            await prisma.financialEntry.delete({ where: { id: id as string } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar lançamento' });
        }
    }
}
