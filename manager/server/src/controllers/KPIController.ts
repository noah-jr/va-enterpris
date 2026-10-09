import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class KPIController {
    static async getKPIs(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            const kpis = await prisma.kPIIndicator.findMany({
                where: { companyId },
                orderBy: { name: 'asc' }
            });
            res.json(kpis);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar KPIs' });
        }
    }

    static async createKPI(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada no contexto.' });
            const { name, department, category, current, target, unit, period, owner, description } = req.body;

            const kpi = await prisma.kPIIndicator.create({
                data: {
                    companyId,

                    name,
                    department,
                    category,
                    current: Number(current),
                    target: Number(target),
                    unit,
                    period,
                    owner,
                    description,
                    status: 'ON_TRACK'
                }
            });
            res.status(201).json(kpi);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar KPI' });
        }
    }

    static async updateKPI(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            const { current, target } = req.body;

            let status = req.body.status;
            if (current !== undefined && target !== undefined) {
                const pct = (Number(current) / Number(target)) * 100;
                if (pct >= 100) status = 'EXCEEDED';
                else if (pct >= 85) status = 'ON_TRACK';
                else if (pct >= 70) status = 'AT_RISK';
                else status = 'BEHIND';
            }

            const kpi = await prisma.kPIIndicator.update({
                where: { id, companyId },
                data: {
                    ...req.body,
                    current: current !== undefined ? Number(current) : undefined,
                    target: target !== undefined ? Number(target) : undefined,
                    status
                }
            });
            res.json(kpi);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar KPI' });
        }
    }
}
