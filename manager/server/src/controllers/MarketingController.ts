import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class MarketingController {
    static async getCampaigns(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            const campaigns = await prisma.marketingCampaign.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(campaigns);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar campanhas' });
        }
    }

    static async createCampaign(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });
            const { title, platform, budget, status, description, engagement } = req.body;
            const campaign = await prisma.marketingCampaign.create({
                data: { companyId, title, platform: platform || 'MULTICANAL', budget: Number(budget) || 0, status: status || 'ACTIVE', description, engagement: Number(engagement) || 0 }
            });
            res.status(201).json(campaign);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar campanha' });
        }
    }

    static async updateCampaign(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            const campaign = await prisma.marketingCampaign.update({
                where: { id, companyId },
                data: req.body
            });
            res.json(campaign);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao actualizar campanha' });
        }
    }

    static async deleteCampaign(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            await prisma.marketingCampaign.delete({ where: { id, companyId } });
            res.json({ message: 'Campanha eliminada' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar campanha' });
        }
    }
}
