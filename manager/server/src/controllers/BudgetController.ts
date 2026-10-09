import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class BudgetController {
    static async getBudgetLines(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const { period } = req.query;
            const budgetLines = await prisma.budgetLine.findMany({
                where: {
                    companyId,
                    ...(period ? { period: { contains: period as string } } : {})
                },
                orderBy: { department: 'asc' }
            });
            res.json(budgetLines);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar linhas de orçamento' });
        }
    }

    static async createBudgetLine(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const { department, category, planned, actual, period, notes } = req.body;

            const budgetLine = await prisma.budgetLine.create({
                data: {
                    companyId,
                    department,
                    category,
                    planned: Number(planned),
                    actual: actual ? Number(actual) : 0,
                    period,
                    notes
                }
            });
            res.status(201).json(budgetLine);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar linha de orçamento' });
        }
    }

    static async updateBudgetLine(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });

            const result = await prisma.budgetLine.updateMany({
                where: { id, companyId },
                data: {
                    ...req.body,
                    planned: req.body.planned ? Number(req.body.planned) : undefined,
                    actual: req.body.actual ? Number(req.body.actual) : undefined,
                }
            });

            if (result.count === 0) {
                return res.status(404).json({ error: 'Linha de orçamento não encontrada' });
            }

            res.json({ message: 'Linha de orçamento actualizada' });
        } catch (error: any) {
            res.status(500).json({ error: 'Erro ao actualizar linha de orçamento', details: error.message });
        }
    }

    static async deleteBudgetLine(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            
            const result = await prisma.budgetLine.deleteMany({
                where: { id, companyId }
            });

            if (result.count === 0) {
                return res.status(404).json({ error: 'Linha de orçamento não encontrada' });
            }

            res.json({ message: 'Linha de orçamento removida' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover linha de orçamento' });
        }
    }
}
