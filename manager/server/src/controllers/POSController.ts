import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuditService } from '../services/AuditService';
import { InvoiceModel } from '../models/InvoiceModel';

// --- Session Management (Caixa) ---

export const openSession = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        const userId = (req as any).userId;
        const { terminalId, openingBalance } = req.body;

        if (!companyId || !terminalId) return res.status(400).json({ error: 'Missing required fields' });

        // Check if there is already an open session for this terminal
        const existing = await prisma.pOSSession.findFirst({
            where: { terminalId, status: 'OPEN' }
        });

        if (existing) return res.status(400).json({ error: 'Terminal já possui uma sessão aberta.' });

        const session = await prisma.pOSSession.create({
            data: {
                companyId,
                terminalId,
                operatorId: userId || 'SISTEMA',
                openingBalance: Number(openingBalance) || 0,
                status: 'OPEN'
            }
        });

        await AuditService.log({
            companyId: companyId as string,
            userId,
            action: 'POS_SESSION_OPEN',
            entity: 'POSSession',
            entityId: session.id,
            details: `Caixa aberto com saldo de ${openingBalance} AOA`
        });

        res.json(session);
    } catch (error) {
        console.error('[POS openSession Error]', error);
        res.status(500).json({ error: 'Falha ao abrir caixa.' });
    }
};

export const closeSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { closingBalance } = req.body;

        const session = await prisma.pOSSession.update({
            where: { id: id as string },
            data: {
                closingBalance: Number(closingBalance),
                closedAt: new Date(),
                status: 'CLOSED'
            }
        });

        await AuditService.log({
            companyId: session.companyId as string,
            userId: (req as any).userId,
            action: 'POS_SESSION_CLOSE',
            entity: 'POSSession',
            entityId: session.id,
            details: `Caixa fechado com saldo final de ${closingBalance} AOA`
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao fechar caixa.' });
    }
};

export const getActiveSession = async (req: Request, res: Response) => {
    try {
        const { terminalId } = req.params;
        const session = await prisma.pOSSession.findFirst({
            where: { terminalId: terminalId as string, status: 'OPEN' },
            include: { 
                sales: true,
                terminal: true
            }
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar sessão ativa.' });
    }
};

// --- Sales Management ---

export const createSale = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        const { terminalId, sessionId, items, paymentMethod, discount } = req.body;

        if (!items || !items.length) return res.status(400).json({ error: 'Venda vazia.' });

        // Calculate totals properly with VAT
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const taxAmount = items.reduce((sum: number, item: any) => sum + ((item.price * item.quantity) * ((item.vatRate || 14) / 100)), 0);
        const finalAmount = Math.max(0, subtotal + taxAmount - (Number(discount) || 0));

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Get Invoice Number
            const nextInvoiceNo = await InvoiceModel.getNextInvoiceNumber(companyId as string, 'FR', tx);

            // 1. Create Invoice (SAF-T)
            const invoice = await InvoiceModel.createInvoice(
                {
                    companyId: companyId as string,
                    clientId: req.body.clientId || null,
                    type: 'FR',
                    number: nextInvoiceNo,
                    status: 'ISSUED',
                    issueDate: new Date(),
                    dueDate: new Date(),
                    subtotal: subtotal,
                    taxAmount: taxAmount,
                    totalAmount: finalAmount,
                    notes: `Sessão POS: ${sessionId} | Terminal: ${terminalId}`
                } as any,
                items.map((item: any) => ({
                    productId: item.productId,
                    description: item.name || 'Artigo POS',
                    quantity: item.quantity,
                    unitPrice: item.price,
                    taxRate: item.vatRate || 14,
                    taxExemptionReason: (item.vatRate || 14) === 0 ? 'M00' : null,
                    total: item.price * item.quantity
                })) as any,
                tx
            );

            // 2. Create POS Sale (For internal POS history)
            const sale = await tx.pOSSale.create({
                data: {
                    id: invoice.id, // share the same ID for relation if needed, or let it auto-generate
                    companyId,
                    terminalId,
                    sessionId,
                    amount: finalAmount,
                    discount: Number(discount) || 0,
                    paymentMethod: paymentMethod || 'CASH',
                    itemsCount: items.length,
                    operator: (req as any).userName || 'OPERADOR',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            totalPrice: (item.price * item.quantity) * (1 + ((item.vatRate || 14) / 100))
                        }))
                    }
                }
            });

            // 2. Update Stock for each item
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });

                // Record stock movement
                await tx.stockMovement.create({
                    data: {
                        companyId,
                        productId: item.productId,
                        type: 'OUT',
                        quantity: item.quantity,
                        notes: `Venda POS #${sale.id.slice(0,8)}`
                    }
                });
            }

            return { ...sale, invoiceNumber: nextInvoiceNo, subtotal, taxAmount };
        });

        await AuditService.log({
            companyId: companyId as string,
            userId: (req as any).userId,
            action: 'POS_SALE_CREATE',
            entity: 'POSSale',
            entityId: result.id,
            details: `Venda processada: ${result.amount} AOA (${items.length} itens)`
        });

        res.json(result);
    } catch (error) {
        console.error('[POS createSale Error]', error);
        res.status(500).json({ error: 'Erro ao processar venda.' });
    }
};

// --- Terminals & Stats ---

export const getTerminals = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        const terminals = await prisma.pOSTerminal.findMany({
            where: { companyId },
            include: {
                sessions: {
                    where: { status: 'OPEN' },
                    take: 1
                },
                _count: { select: { sales: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(terminals);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar terminais.' });
    }
};

export const createTerminal = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        const { name, description } = req.body;
        const terminal = await prisma.pOSTerminal.create({
            data: { companyId, name, description }
        });
        res.json(terminal);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar terminal.' });
    }
};

export const getSales = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        const sales = await prisma.pOSSale.findMany({
            where: { companyId },
            include: { 
                items: { include: { product: { select: { name: true } } } },
                terminal: { select: { name: true } }
            },
            orderBy: { date: 'desc' },
            take: 50
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar vendas.' });
    }
};

export const getPOSStats = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todayRevenue, activeSessions, totalProducts] = await Promise.all([
            prisma.pOSSale.aggregate({
                where: { companyId, date: { gte: today } },
                _sum: { amount: true }
            }),
            prisma.pOSSession.count({ where: { companyId, status: 'OPEN' } }),
            prisma.product.count({ where: { companyId } })
        ]);

        res.json({
            todayRevenue: todayRevenue._sum.amount || 0,
            activeSessions,
            totalProducts,
            status: 'ONLINE'
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
    }
};
