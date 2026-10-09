import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class RiskController {
    static async getRisks(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const risks = await prisma.risk.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(risks);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar riscos' });
        }
    }

    static async createRisk(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { title, description, category, department, probability, impact, level, owner, mitigation, dueDate } = req.body;

            const score = (Number(probability) || 1) * (Number(impact) || 1);

            const risk = await prisma.risk.create({
                data: {
                    companyId,
                    title,
                    description,
                    category,
                    department,
                    probability: Number(probability),
                    impact: Number(impact),
                    score,
                    level,
                    status: 'OPEN',
                    owner,
                    mitigation,
                    dueDate: dueDate ? new Date(dueDate) : null
                }
            });
            res.status(201).json(risk);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar risco' });
        }
    }

    static async updateRisk(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { probability, impact } = req.body;

            const existing = await prisma.risk.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Risco não encontrado' });

            let data = { ...req.body };
            if (probability !== undefined || impact !== undefined) {
                const p = probability !== undefined ? Number(probability) : existing.probability;
                const i = impact !== undefined ? Number(impact) : existing.impact;
                data.score = p * i;
            }

            const risk = await prisma.risk.update({
                where: { id: id as string },
                data
            });
            res.json(risk);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar risco' });
        }
    }

    static async deleteRisk(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.risk.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Risco não encontrado' });

            await prisma.risk.delete({ where: { id: id as string } });
            res.json({ message: 'Risco removido' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover risco' });
        }
    }
}
