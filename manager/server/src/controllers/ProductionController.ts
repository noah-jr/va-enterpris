import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class ProductionController {
    static async getOrders(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const orders = await prisma.productionOrder.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });

            const kpis = {
                total: orders.length,
                completed: orders.filter((o: any) => o.status === 'COMPLETED').length,
                inProgress: orders.filter((o: any) => o.status === 'IN_PROGRESS').length,
                pending: orders.filter((o: any) => o.status === 'PENDING').length,
            };

            res.json({ orders, kpis });
        } catch (error) {
            console.error('[Production Error]', error);
            res.status(500).json({ error: 'Erro ao carregar ordens de produção' });
        }
    }

    static async createOrder(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { productName, quantity, priority, notes } = req.body;
            
            // Gerar número de ordem sequencial ou aleatório
            const orderCount = await prisma.productionOrder.count({ where: { companyId } });
            const orderNumber = `OF-${new Date().getFullYear()}-${(orderCount + 1).toString().padStart(4, '0')}`;

            const order = await prisma.productionOrder.create({
                data: {
                    companyId,
                    orderNumber,
                    productName,
                    quantity: Number(quantity),
                    priority,
                    notes,
                    status: 'PENDING',
                    progress: 0
                }
            });

            res.status(201).json(order);
        } catch (error) {
            console.error('[Create Production Order Error]', error);
            res.status(500).json({ error: 'Erro ao criar ordem de produção' });
        }
    }

    static async updateOrder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = req.companyId as string;
            const { status, progress } = req.body;

            const order = await prisma.productionOrder.updateMany({
                where: { id: id as string, companyId },
                data: { 
                    status, 
                    progress: Number(progress),
                    updatedAt: new Date()
                }
            });

            res.json(order);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar ordem de produção' });
        }
    }

    static async deleteOrder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = req.companyId as string;

            await prisma.productionOrder.deleteMany({
                where: { id: id as string, companyId }
            });

            res.sendStatus(204);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar ordem de produção' });
        }
    }

    static async getLines(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const products = await prisma.product.findMany({
                where: { companyId, stock: { gt: 0 } },
                orderBy: { stock: 'desc' },
                take: 5
            });

            const lines = products.map((p: any, idx: number) => ({
                id: p.id,
                name: `L-${idx + 1} // ${(p.name || 'LINHA').slice(0, 15).toUpperCase()}`,
                product: p.name,
                status: p.stock > (p.minStock || 0) ? 'OPERATIVA' : 'MANUTENÇÃO',
                speed: `${Math.min(Math.round((p.stock / Math.max(p.minStock || 1, 1)) * 50), 100)}%`,
                load: Math.min(Math.round((p.stock / Math.max(p.minStock || 10, 1)) * 100), 100),
                temp: `${22 + idx}°C`
            }));

            res.json(lines);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar linhas de produção' });
        }
    }

    static async getMaintenanceRecords(req: Request, res: Response) {
        try {
            const companyId = req.companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const assets = await prisma.asset.findMany({
                where: { companyId },
                include: { maintenance: { orderBy: { date: 'desc' }, take: 3 } },
                orderBy: { createdAt: 'desc' }
            });

            const records = assets.flatMap((a: any) =>
                a.maintenance.map((m: any) => ({ ...m, assetName: a.name, assetCode: a.code }))
            ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            res.json(records);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar registos de manutenção' });
        }
    }
}
