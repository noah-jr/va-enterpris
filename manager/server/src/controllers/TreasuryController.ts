import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuditService } from '../services/AuditService';

/**
 * TreasuryController — Módulo de Tesouraria Institucional
 */
export class TreasuryController {
    static async getSummary(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const [receivables, payables, bankAccounts] = await Promise.all([
                prisma.financialEntry.aggregate({
                    where: { companyId, type: 'RECEIVABLE', status: 'PAID' },
                    _sum: { amount: true }
                }),
                prisma.financialEntry.aggregate({
                    where: { companyId, type: 'PAYABLE', status: 'PAID' },
                    _sum: { amount: true }
                }),
                prisma.bankAccount.aggregate({
                    where: { companyId },
                    _sum: { balance: true }
                })
            ]);

            res.json({
                totalLiquidity: Number(bankAccounts._sum.balance) || 0,
                totalReceivables: Number(receivables._sum.amount) || 0,
                totalPayables: Number(payables._sum.amount) || 0,
                netPosition: (Number(receivables._sum.amount) || 0) - (Number(payables._sum.amount) || 0),
            });
        } catch (error) {
            console.error('[TreasurySummary Error]', error);
            res.status(500).json({ error: 'Erro ao obter resumo de tesouraria' });
        }
    }

    static async listEntries(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const entries = await prisma.financialEntry.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            res.json(entries);
        } catch (error) {
            console.error('[TreasuryEntries Error]', error);
            res.status(500).json({ error: 'Erro ao listar lançamentos' });
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

            await AuditService.log({
                companyId: companyId as string,
                userId: (req as any).userId,
                action: 'TREASURY_ENTRY_CREATE',
                entity: 'FinancialEntry',
                entityId: entry.id,
                details: `Movimento de tesouraria: ${entry.description} - ${entry.amount} AOA`
            });

            res.status(201).json(entry);
        } catch (error) {
            console.error('[TreasuryCreate Error]', error);
            res.status(500).json({ error: 'Erro ao criar lançamento de tesouraria' });
        }
    }

    static async updateEntry(req: Request, res: Response) {
        try {
            const { id } = req.params;
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
            await prisma.financialEntry.delete({ where: { id: id as string } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar lançamento' });
        }
    }

    static async markPaid(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const entry = await prisma.financialEntry.update({
                where: { id: id as string },
                data: { status: 'PAID', paidAt: new Date() }
            });

            await AuditService.log({
                companyId: entry.companyId as string,
                userId: (req as any).userId,
                action: 'TREASURY_ENTRY_PAY',
                entity: 'FinancialEntry',
                entityId: entry.id,
                details: `Liquidação de tesouraria: ${entry.description}`
            });

            res.json(entry);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao liquidar lançamento' });
        }
    }
}
