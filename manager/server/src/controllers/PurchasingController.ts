import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class PurchasingController {
    static async getOrders(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const orders = await prisma.purchaseOrder.findMany({
                where: { companyId },
                include: {
                    supplier: { select: { name: true } },
                    items: { include: { product: { select: { name: true } } } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar ordens de compra' });
        }
    }

    static async createOrder(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { supplierId, expectedDate, notes, items } = req.body;

            const totalAmount = items.reduce((sum: number, item: any) =>
                sum + (Number(item.unitCost) * Number(item.quantity)), 0);

            const lastOrder = await prisma.purchaseOrder.count({ where: { companyId } });
            const number = `OC ${new Date().getFullYear()}/${String(lastOrder + 1).padStart(3, '0')}`;

            const order = await prisma.purchaseOrder.create({
                data: {
                    companyId,
                    supplierId,
                    number,
                    expectedDate: expectedDate ? new Date(expectedDate) : undefined,
                    notes,
                    totalAmount,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: Number(item.quantity),
                            unitCost: Number(item.unitCost),
                            totalCost: Number(item.unitCost) * Number(item.quantity)
                        }))
                    }
                },
                include: { supplier: true, items: true }
            });
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar ordem de compra' });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.purchaseOrder.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Ordem de compra não encontrada' });

            const { status } = req.body;
            const order = await prisma.purchaseOrder.update({
                where: { id: id as string },
                data: { status }
            });
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar ordem de compra' });
        }
    }
}
