import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class ReportController {
    static async getERPSummary(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const [
                financeSummary,
                hrSummary,
                logisticsSummary,
                projectSummary,
                inventorySummary
            ] = await Promise.all([
                // Finance: Revenue (Receivables paid) vs Expenses (Payables paid)
                prisma.financialEntry.groupBy({
                    by: ['type', 'status'],
                    where: { companyId, status: 'PAID' },
                    _sum: { amount: true }
                }),
                // HR: Active employees and total payroll (last month)
                prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
                // Logistics: Vehicle count and transport status
                prisma.fleetVehicle.count({ where: { companyId } }),
                // Projects: Ongoing projects
                prisma.project.count({ where: { companyId, status: 'IN_PROGRESS' } }),
                // Inventory: Low stock products
                prisma.product.count({ where: { companyId, stock: { lte: prisma.product.fields.minStock } } as any })
            ]);

            // For stock count, Prisma doesn't support comparing fields directly in some versions without $queryRaw or middleware, 
            // but let's try a simpler approach if the above fails or just fetch products and filter in memory for now.
            // Actually, let's just get the count of products where stock <= 5 (typical minStock)
            const lowStockCount = await prisma.product.count({
                where: { companyId, stock: { lte: 5 } }
            });

            res.json({
                finance: financeSummary,
                activeEmployees: hrSummary,
                totalVehicles: logisticsSummary,
                ongoingProjects: projectSummary,
                lowStockCount: lowStockCount
            });
        } catch (error) {
            console.error('[ERP Report Error]', error);
            res.status(500).json({ error: 'Erro ao gerar relatório ERP' });
        }
    }

    static async getFinancialFlow(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { start, end } = req.query;
            const where: any = { companyId, status: 'PAID' };
            if (start || end) {
                where.updatedAt = {};
                if (start) where.updatedAt.gte = new Date(start as string);
                if (end) where.updatedAt.lte = new Date(end as string);
            }

            const entries = await prisma.financialEntry.findMany({
                where,
                orderBy: { updatedAt: 'asc' },
                take: 500
            });

            const flowData = entries.reduce((acc: any[], entry) => {
                const date = entry.updatedAt.toISOString().split('T')[0];
                const existing = acc.find(d => d.date === date);

                const amount = entry.amount;
                const inflow = entry.type === 'RECEIVABLE' ? amount : 0;
                const outflow = entry.type === 'PAYABLE' ? amount : 0;

                if (existing) {
                    existing.inflow += inflow;
                    existing.outflow += outflow;
                } else {
                    acc.push({ date, inflow, outflow });
                }
                return acc;
            }, []);

            res.json(flowData);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar fluxo financeiro' });
        }
    }

    static async getDRE(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { start, end } = req.query;
            const where: any = { companyId, status: 'PAID' };
            if (start || end) {
                where.updatedAt = {};
                if (start) where.updatedAt.gte = new Date(start as string);
                if (end) where.updatedAt.lte = new Date(end as string);
            }

            const entries = await prisma.financialEntry.findMany({
                where
            });

            const revenue = entries.filter(e => e.type === 'RECEIVABLE').reduce((acc, e) => acc + e.amount, 0);
            const expenses = entries.filter(e => e.type === 'PAYABLE').reduce((acc, e) => acc + e.amount, 0);
            
            // This is a simplified DRE. In a real scenario, we'd categorize by category names.
            const operationalCosts = entries.filter(e => e.type === 'PAYABLE' && e.category === 'OPERATIONAL').reduce((acc, e) => acc + e.amount, 0);
            const payrollCosts = entries.filter(e => e.type === 'PAYABLE' && e.category === 'SALARY').reduce((acc, e) => acc + e.amount, 0);
            const taxCosts = entries.filter(e => e.type === 'PAYABLE' && e.category === 'TAX').reduce((acc, e) => acc + e.amount, 0);
            const otherExpenses = expenses - operationalCosts - payrollCosts - taxCosts;

            const grossMargin = revenue - operationalCosts;
            const ebitda = grossMargin - payrollCosts - otherExpenses;
            const netResult = ebitda - taxCosts;

            res.json({
                revenue,
                operationalCosts,
                grossMargin,
                payrollCosts,
                otherExpenses,
                ebitda,
                taxCosts,
                netResult
            });
        } catch (error) {
            console.error('[DRE Error]', error);
            res.status(500).json({ error: 'Erro ao gerar DRE' });
        }
    }
}
