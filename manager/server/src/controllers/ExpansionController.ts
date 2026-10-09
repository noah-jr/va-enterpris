import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class ExpansionController {
    static async getMarkets(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const markets = await prisma.market.findMany({
                where: { companyId },
                orderBy: { revenue: 'desc' }
            });
            res.json(markets);
        } catch (error) {
            console.error('[GetMarkets Error]:', error);
            res.status(500).json({ error: 'Erro ao buscar mercados internacionais' });
        }
    }

    static async createMarket(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            
            const { name, country, status, revenue, clients, growth, marketShare, currency, entryYear, manager, notes } = req.body;

            const market = await prisma.market.create({
                data: {
                    companyId,
                    name,
                    country,
                    status: status || 'PLANNED',
                    revenue: Number(revenue) || 0,
                    clients: Number(clients) || 0,
                    growth: Number(growth) || 0,
                    marketShare: Number(marketShare) || 0,
                    currency: currency || 'AOA',
                    entryYear: Number(entryYear) || new Date().getFullYear(),
                    manager,
                    notes
                }
            });
            res.status(201).json(market);
        } catch (error) {
            console.error('[CreateMarket Error]:', error);
            res.status(500).json({ error: 'Erro ao registar mercado estratégico' });
        }
    }

    static async updateMarket(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.market.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Mercado não encontrado no seu ecossistema' });

            // Whitelist fields to update
            const { name, country, status, revenue, clients, growth, marketShare, currency, entryYear, manager, notes } = req.body;
            
            const data: any = {};
            if (name !== undefined) data.name = name;
            if (country !== undefined) data.country = country;
            if (status !== undefined) data.status = status;
            if (revenue !== undefined) data.revenue = Number(revenue);
            if (clients !== undefined) data.clients = Number(clients);
            if (growth !== undefined) data.growth = Number(growth);
            if (marketShare !== undefined) data.marketShare = Number(marketShare);
            if (currency !== undefined) data.currency = currency;
            if (entryYear !== undefined) data.entryYear = Number(entryYear);
            if (manager !== undefined) data.manager = manager;
            if (notes !== undefined) data.notes = notes;

            const market = await prisma.market.update({
                where: { id: id as string },
                data
            });
            res.json(market);
        } catch (error) {
            console.error('[UpdateMarket Error]:', error);
            res.status(500).json({ error: 'Erro ao actualizar dados do mercado' });
        }
    }

    static async deleteMarket(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.market.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Mercado não encontrado' });

            await prisma.market.delete({
                where: { id: id as string }
            });
            res.sendStatus(204);
        } catch (error) {
            console.error('[DeleteMarket Error]:', error);
            res.status(500).json({ error: 'Erro ao eliminar mercado do ecossistema' });
        }
    }
}
