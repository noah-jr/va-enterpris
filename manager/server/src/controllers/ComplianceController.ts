import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class ComplianceController {
    static async getIncidents(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada.' });
            const incidents = await prisma.hSEIncident.findMany({
                where: { companyId },
                orderBy: { date: 'desc' }
            });
            res.json(incidents);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch incidents' });
        }
    }

    static async createIncident(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada.' });
            const { title, type, description, status, date, location, reporter, level } = req.body;
            const incident = await prisma.hSEIncident.create({
                data: {
                    companyId,
                    title,
                    type,
                    description,
                    location: location || 'BASE',
                    reporter: reporter || 'VA-SYSTEM',
                    status: status || 'INVESTIGATING',
                    level: level || 'MEDIUM',
                    date: date ? new Date(date) : new Date()
                }
            });
            res.status(201).json(incident);
        } catch (error) {
            console.error('[HSE Error]', error);
            res.status(500).json({ error: 'Failed to report incident' });
        }
    }

    static async getHSESats(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada.' });

            const lastCriticalIncident = await prisma.hSEIncident.findFirst({
                where: { 
                    companyId,
                    level: { in: ['HIGH', 'CRITICAL'] }
                },
                orderBy: { date: 'desc' }
            });

            const totalIncidents = await prisma.hSEIncident.count({ where: { companyId } });
            const openIncidents = await prisma.hSEIncident.count({ where: { companyId, status: 'OPEN' } });

            let daysWithoutIncidents = 0;
            if (lastCriticalIncident) {
                const diffTime = Math.abs(new Date().getTime() - new Date(lastCriticalIncident.date).getTime());
                daysWithoutIncidents = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else {
                // If no incidents, use company creation date or a default
                daysWithoutIncidents = 365; // Simulated for new companies
            }

            res.json({
                daysWithoutIncidents,
                totalIncidents,
                openIncidents,
                trifRate: (totalIncidents / 100).toFixed(2), // Simple mock-ish calc based on real total
                airQuality: 'Nominal',
                ppeCompliance: 100
            });
        } catch (error) {
            console.error('[HSE Stats Error]', error);
            res.status(500).json({ error: 'Erro ao carregar estatísticas HSE' });
        }
    }

    static async getInspections(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada.' });
            const inspections = await prisma.qualityInspection.findMany({
                where: { companyId },
                orderBy: { date: 'desc' }
            });
            res.json(inspections);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch inspections' });
        }
    }

    static async getQuality(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada.' });

            const inspections = await prisma.qualityInspection.findMany({
                where: { companyId },
                orderBy: { date: 'desc' }
            });

            // Map database records to frontend expected format
            const qualityData = inspections.map((ins: any) => ({
                id: ins.id,
                title: ins.item,
                code: `ISO-${ins.item.slice(0, 3).toUpperCase()}-${new Date(ins.date).getFullYear()}`,
                status: ins.result === 'PASSED' ? 'PASSED' : ins.result === 'FAILED' ? 'FAILED' : 'IN_REVIEW',
                date: ins.date,
                description: ins.notes || `Auditoria de conformidade para ${ins.item} realizada por ${ins.inspector}.`,
                score: ins.score,
                inspector: ins.inspector
            }));

            res.json(qualityData);
        } catch (error) {
            console.error('[Quality Error]', error);
            res.status(500).json({ error: 'Erro ao carregar padrões de qualidade' });
        }
    }

    static async getExpenses(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada.' });
            const expenses = await prisma.expenseClaim.findMany({
                where: { companyId },
                orderBy: { date: 'desc' }
            });
            res.json(expenses);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch expenses' });
        }
    }

    static async createExpense(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada.' });
            const { title, category, amount, date, notes } = req.body;
            const expense = await prisma.expenseClaim.create({
                data: {
                    companyId,
                    title,
                    category,
                    amount: Number(amount),
                    date: date ? new Date(date) : new Date(),
                    status: 'PENDING'
                }
            });
            res.status(201).json(expense);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create expense' });
        }
    }

    static async updateExpense(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            const expense = await prisma.expenseClaim.update({
                where: { id, companyId } as any,
                data: {
                    ...req.body,
                    amount: req.body.amount ? Number(req.body.amount) : undefined,
                    date: req.body.date ? new Date(req.body.date) : undefined
                }
            });
            res.json(expense);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update expense' });
        }
    }

    static async deleteExpense(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            await prisma.expenseClaim.delete({ where: { id, companyId } as any });
            res.json({ message: 'Expense deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete expense' });
        }
    }
}
