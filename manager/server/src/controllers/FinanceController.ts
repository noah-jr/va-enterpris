import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuditService } from '../services/AuditService';


export class FinanceController {
    static async getEntries(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const { type } = req.query;
            const entries = await prisma.financialEntry.findMany({
                where: { companyId, ...(type ? { type: type as string } : {}) },
                include: {
                    supplier: { select: { name: true } },
                    client: { select: { name: true } }
                },
                orderBy: { dueDate: 'asc' }
            });
            res.json(entries);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar lançamentos financeiros' });
        }
    }

    static async createEntry(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const { description, type, amount, dueDate, category, supplierId, clientId, notes } = req.body;
            const entry = await prisma.financialEntry.create({
                data: {
                    companyId,
                    description,
                    type,
                    amount: Number(amount),
                    dueDate: new Date(dueDate),
                    category,
                    supplierId: supplierId || null,
                    clientId: clientId || null,
                    notes,
                    status: 'PENDING'
                }
            });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req as any).userId,
                action: 'FINANCE_ENTRY_CREATE',
                entity: 'FinancialEntry',
                entityId: entry.id,
                details: `Lançamento criado: ${entry.description} - ${entry.amount} AOA`
            });

            res.status(201).json(entry);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar lançamento financeiro' });
        }
    }

    static async markAsPaid(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            const entry = await prisma.financialEntry.update({
                where: { id, companyId },
                data: { status: 'PAID', paidAt: new Date() }
            });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req as any).userId,
                action: 'FINANCE_ENTRY_PAY',
                entity: 'FinancialEntry',
                entityId: entry.id,
                details: `Liquidação de lançamento: ${entry.description}`
            });

            res.json(entry);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao marcar como pago' });
        }
    }

    static async deleteEntry(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            await prisma.financialEntry.delete({ where: { id, companyId } });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req as any).userId,
                action: 'FINANCE_ENTRY_DELETE',
                entity: 'FinancialEntry',
                entityId: id,
                details: `Remoção de lançamento financeiro`
            });

            res.json({ message: 'Lançamento removido' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover lançamento' });
        }
    }

    static async updateEntry(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            const entry = await prisma.financialEntry.update({
                where: { id, companyId },
                data: {
                    ...req.body,
                    amount: req.body.amount ? Number(req.body.amount) : undefined,
                    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
                }
            });
            res.json(entry);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar lançamento' });
        }
    }

    static async getBankAccounts(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const accounts = await prisma.bankAccount.findMany({ where: { companyId } });
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar contas bancárias' });
        }
    }

    static async createBankAccount(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const { bank, iban, balance, type, color } = req.body;
            const account = await prisma.bankAccount.create({
                data: { companyId, bank, iban, balance: Number(balance), type, color }
            });
            res.status(201).json(account);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar conta bancária' });
        }
    }

    static async updateBankAccount(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            const account = await prisma.bankAccount.update({
                where: { id, companyId },
                data: {
                    ...req.body,
                    balance: req.body.balance !== undefined ? Number(req.body.balance) : undefined
                }
            });
            res.json(account);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar conta bancária' });
        }
    }

    static async deleteBankAccount(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            await prisma.bankAccount.delete({ where: { id, companyId } });
            res.json({ message: 'Conta bancária removida' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover conta bancária' });
        }
    }

    static async getSummary(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });

            const [entries, bankAccounts, summaryData] = await Promise.all([
                prisma.financialEntry.findMany({ where: { companyId } }),
                prisma.bankAccount.findMany({ where: { companyId } }),
                prisma.financialEntry.aggregate({
                    where: { companyId },
                    _sum: { amount: true }
                })
            ]);

            const totalAssets = bankAccounts.reduce((acc, b) => acc + (Number(b.balance) || 0), 0) + 
                               entries.filter(e => e.type === 'RECEIVABLE').reduce((acc, e) => acc + Number(e.amount), 0);
            
            const totalLiabilities = entries.filter(e => e.type === 'PAYABLE' && e.status === 'PENDING')
                                            .reduce((acc, e) => acc + Number(e.amount), 0);

            const totalRevenue = entries.filter(e => e.type === 'RECEIVABLE' && e.status === 'PAID')
                                        .reduce((acc, e) => acc + Number(e.amount), 0);
            
            const totalExpenses = entries.filter(e => e.type === 'PAYABLE' && e.status === 'PAID')
                                         .reduce((acc, e) => acc + Number(e.amount), 0);

            const netProfit = totalRevenue - totalExpenses;

            // Simplified Accounting Plan (Categories)
            const categoryMap: Record<string, any> = {
                'OPERATIONAL': { code: '6.1', name: 'Custos Operacionais', type: 'CREDIT', balance: 0 },
                'TAX': { code: '6.4', name: 'Impostos e Taxas', type: 'CREDIT', balance: 0 },
                'SALARY': { code: '6.3', name: 'Pessoal / Salários', type: 'CREDIT', balance: 0 },
                'INVESTMENT': { code: '1.2', name: 'Imobilizações / CAPEX', type: 'DEBIT', balance: 0 },
                'REVENUE': { code: '7.1', name: 'Vendas e Serviços', type: 'DEBIT', balance: 0 }
            };

            entries.forEach(e => {
                const cat = categoryMap[e.category || 'OPERATIONAL'] || categoryMap['OPERATIONAL'];
                cat.balance += Number(e.amount);
            });

            // Taxes (IVA)
            const ivaLiquidado = entries.filter(e => e.type === 'RECEIVABLE').reduce((acc, e) => acc + (Number(e.amount) * 0.14), 0);
            const ivaDedutivel = entries.filter(e => e.type === 'PAYABLE').reduce((acc, e) => acc + (Number(e.amount) * 0.14), 0);

            const totalReceivable = entries.filter(e => e.type === 'RECEIVABLE')
                                           .reduce((acc, e) => acc + Number(e.amount), 0);
            
            const totalPayable = entries.filter(e => e.type === 'PAYABLE')
                                        .reduce((acc, e) => acc + Number(e.amount), 0);

            res.json({
                totalAssets,
                totalLiabilities,
                totalReceivable,
                totalPayable,
                netProfit,
                ebitdaMargin: totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '0%',
                categories: Object.values(categoryMap),
                ivaLiquidado,
                ivaDedutivel,
                irtRetido: totalExpenses * 0.03, // Mock IRT calculation
                overdue: entries.filter(e => e.status === 'PENDING' && e.dueDate < new Date()).length
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
        }
    }

    static async reconcile(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });

            const result = await prisma.financialEntry.updateMany({
                where: { companyId, status: 'PENDING' },
                data: { status: 'PAID', paidAt: new Date() }
            });

            // Registrar no Log de Auditoria
            if (result.count > 0) {
                await prisma.auditLog.create({
                    data: {
                        companyId,
                        userId: (req.user as any)?.id,
                        action: 'FINANCE_RECONCILE',
                        entity: 'FinancialEntry',
                        entityId: 'BATCH_RECONCILE',
                        details: `Conciliação processada para ${result.count} lançamentos pendentes.`
                    }
                });
            }

            res.json({ message: 'Conciliação processada com sucesso', count: result.count });
        } catch (error: any) {
            console.error('Reconcile Error:', error);
            res.status(500).json({ error: 'Erro ao processar conciliação', details: error.message });
        }
    }
}
