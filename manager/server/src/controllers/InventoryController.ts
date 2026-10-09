import { Request, Response } from 'express';
import prisma from '../lib/prisma';


/**
 * Inventory is backed by the Product model (stock field).
 * Returns products enriched with stock movement info derived from purchasing orders.
 */
export class InventoryController {
    static async getInventory(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const products = await prisma.product.findMany({
                where: { companyId },
                orderBy: { name: 'asc' }
            });

            // Derive inventory records from products
            const inventory = products.map((p: any) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                category: p.category,
                classification: p.classification,
                type: p.type,
                imageUrl: p.imageUrl,
                stock: p.stock ?? 0,
                minStock: p.minStock ?? 0,
                unit: p.unit ?? 'UN',
                purchasePrice: p.purchasePrice ?? 0,
                salePrice: p.salePrice ?? 0,
                status: (p.stock ?? 0) === 0
                    ? 'OUT_OF_STOCK'
                    : (p.stock ?? 0) <= (p.minStock ?? 0)
                        ? 'LOW_STOCK'
                        : 'IN_STOCK'
            }));

            const totalValue = inventory.reduce((acc: number, i: any) => acc + (i.stock * i.purchasePrice), 0);
            const lowStock = inventory.filter((i: any) => i.status === 'LOW_STOCK').length;
            const outOfStock = inventory.filter((i: any) => i.status === 'OUT_OF_STOCK').length;

            res.json({ items: inventory, totalValue, lowStock, outOfStock, total: inventory.length });
        } catch (error) {
            console.error('[Inventory Error]', error);
            res.status(500).json({ error: 'Erro ao carregar inventário' });
        }
    }

    static async adjustStock(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const id = req.params.id as string;
            const { quantity, type } = req.body; // type: 'IN' | 'OUT' | 'ADJUST'

            const product = await prisma.product.findUnique({ where: { id } });
            if (!product || product.companyId !== companyId) return res.status(404).json({ error: 'Produto não encontrado' });

            const current = product.stock ?? 0;
            let newStock = current;
            if (type === 'IN') newStock = current + Number(quantity);
            else if (type === 'OUT') newStock = Math.max(0, current - Number(quantity));
            else if (type === 'ADJUST') newStock = Number(quantity);

            const updated = await prisma.product.update({
                where: { id },
                data: { stock: newStock }
            });

            res.json({ ...updated, previousStock: current });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao ajustar stock' });
        }
    }

    static async createItem(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { name, code, category, stock, unit, purchasePrice, minStock, type, classification } = req.body;

            let imageUrl = undefined;
            if (req.file) {
                const file = req.file as any;
                imageUrl = file.location || file.path;
                if (process.env.STORAGE_PROVIDER === 'local' || !process.env.STORAGE_PROVIDER) {
                    const host = req.get('host');
                    const protocol = req.protocol;
                    imageUrl = `${protocol}://${host}/${file.path.replace(/\\/g, '/')}`;
                }
            } else if (req.body.imageUrl) {
                imageUrl = req.body.imageUrl;
            }

            const existing = await prisma.product.findUnique({
                where: { companyId_code: { companyId, code } }
            });

            if (existing) return res.status(400).json({ error: 'Um item com este código já existe' });

            const item = await prisma.product.create({
                data: {
                    companyId,
                    name,
                    code,
                    category,
                    stock: Number(stock),
                    unit: unit || 'UN',
                    purchasePrice: Number(purchasePrice),
                    salePrice: Number(purchasePrice) * 1.3,
                    minStock: Number(minStock),
                    price: Number(purchasePrice) * 1.3, // Automatic markup for sale price
                    cost: Number(purchasePrice),
                    type: type || 'PRODUCT',
                    classification: classification || null,
                    imageUrl
                }
            });

            res.status(201).json(item);
        } catch (error) {
            console.error('[Inventory Create Error]', error);
            res.status(500).json({ error: 'Erro ao registar item no inventário' });
        }
    }

    static async deleteItem(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const id = req.params.id as string;

            await prisma.product.delete({
                where: { id, companyId }
            });

            res.json({ message: 'Item removido do inventário' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover item do inventário' });
        }
    }
}
