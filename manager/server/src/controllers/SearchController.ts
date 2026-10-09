import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class SearchController {
    static async globalSearch(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            const query = (req.query.q as string || '').trim();

            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            if (!query || query.length < 2) return res.json({ invoices: [], clients: [], products: [] });

            const [invoices, clients, products] = await Promise.all([
                prisma.invoice.findMany({
                    where: {
                        companyId,
                        OR: [
                            { number: { contains: query, mode: 'insensitive' } },
                            { customerName: { contains: query, mode: 'insensitive' } },
                            { customerNif: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { client: { select: { name: true } } }
                }),
                prisma.client.findMany({
                    where: {
                        companyId,
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { nif: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 5
                }),
                prisma.product.findMany({
                    where: {
                        companyId,
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { code: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 5
                })
            ]);

            res.json({
                invoices: invoices.map(i => ({
                    id: i.id,
                    title: i.number,
                    subtitle: i.client?.name || i.customerName || 'Consumidor',
                    type: 'INVOICE',
                    url: `/invoices`
                })),
                clients: clients.map(c => ({
                    id: c.id,
                    title: c.name,
                    subtitle: `NIF: ${c.nif}`,
                    type: 'CLIENT',
                    url: `/clients`
                })),
                products: products.map(p => ({
                    id: p.id,
                    title: p.name,
                    subtitle: `${p.price} Kz`,
                    type: 'PRODUCT',
                    url: `/products`
                }))
            });

        } catch (error) {
            console.error('[Search Error]', error);
            res.status(500).json({ error: 'Search failed' });
        }
    }
}
