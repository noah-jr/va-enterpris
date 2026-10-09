import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class RecruitmentController {
    static async getCandidates(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const candidates = await prisma.candidate.findMany({
                where: { companyId },
                orderBy: { appliedAt: 'desc' }
            });
            res.json(candidates);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar candidatos' });
        }
    }

    static async createCandidate(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { name, email, phone, position, department, stage, source, rating, notes } = req.body;

            const candidate = await prisma.candidate.create({
                data: {
                    companyId,
                    name,
                    email,
                    phone,
                    position,
                    department,
                    stage: stage || 'APPLIED',
                    source,
                    rating: rating ? Number(rating) : 0,
                    notes
                }
            });
            res.status(201).json(candidate);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao registar candidato' });
        }
    }

    static async updateCandidate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.candidate.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Candidato não encontrado' });

            const candidate = await prisma.candidate.update({
                where: { id: id as string },
                data: req.body
            });
            res.json(candidate);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar candidato' });
        }
    }

    static async getKpis(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const [total, screening, interview, offer] = await Promise.all([
                prisma.candidate.count({ where: { companyId } }),
                prisma.candidate.count({ where: { companyId, stage: 'SCREENING' } }),
                prisma.candidate.count({ where: { companyId, stage: 'INTERVIEW' } }),
                prisma.candidate.count({ where: { companyId, stage: 'OFFER' } })
            ]);

            res.json({ total, screening, interview, offer });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar KPIs' });
        }
    }

    static async getOptions(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            // Extract distinct departments and sources used in the database for this company
            const [deptRows, sourceRows] = await Promise.all([
                prisma.candidate.findMany({ where: { companyId }, select: { department: true }, distinct: ['department'] }),
                prisma.candidate.findMany({ where: { companyId, source: { not: null } }, select: { source: true }, distinct: ['source'] })
            ]);

            let departments = deptRows.map(r => r.department).filter(Boolean);
            let sources = sourceRows.map(r => r.source).filter(Boolean) as string[];

            // Default fallbacks if empty
            if (departments.length === 0) departments = ['TI', 'RH', 'Comercial', 'Financeiro', 'Operações'];
            if (sources.length === 0) sources = ['LinkedIn', 'Candidatura Espontânea', 'Referência Interna', 'Portal de Vagas'];

            res.json({ departments, sources });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar opções' });
        }
    }
}
