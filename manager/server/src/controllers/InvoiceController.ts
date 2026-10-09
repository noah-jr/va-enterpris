import { Request, Response } from 'express';
import { InvoiceModel } from '../models/InvoiceModel';
import { AuditService } from '../services/AuditService';
import { InvoicePdfService } from '../services/InvoicePdfService';
import prisma from '../lib/prisma';



export class InvoiceController {
    static async index(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const invoices = await InvoiceModel.getAllInvoices(companyId);
            res.json(invoices);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while fetching invoices' });
        }
    }

    static async show(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;

            const invoice = await InvoiceModel.getInvoiceById(id, companyId);
            if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

            res.json(invoice);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while fetching invoice' });
        }
    }

    static async downloadPdf(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;

            const invoice = await InvoiceModel.getInvoiceById(id, companyId);
            if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

            let appUrl = (req.headers.origin as string) || process.env.FRONTEND_URL || 'https://app.va-onegest.co.ao';
            if (req.headers.referer && !req.headers.origin) {
                try {
                    const url = new URL(req.headers.referer);
                    appUrl = url.origin;
                } catch (e) {}
            }

            await InvoicePdfService.generateInvoice(invoice, res, appUrl);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const { clientId, customerName, customerNif, customerAddress, type, items, dueDate, issueDate } = req.body;

            if ((!clientId && !customerName) || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Cliente (registado ou ad-hoc) e pelo menos um item são obrigatórios' });
            }

            // Cálculo de totais (em prod recalcular do DB do produto para segurança)
            let totalAmount = 0;
            let totalVat = 0;

            const parsedItems = items.map((item: any) => {
                const price = Number(item.price || item.unitPrice || 0);
                const qty = Number(item.quantity || 1);
                const vat = Number(item.vatRate || 14);
                const subtotal = price * qty;
                const vatAmt = subtotal * (vat / 100);
                
                totalAmount += subtotal;
                totalVat += vatAmt;

                return {
                    productId: item.productId,
                    quantity: qty,
                    unitPrice: price,
                    vatRate: vat,
                    totalAmount: subtotal + vatAmt,
                    description: item.name || item.product?.name || 'Venda de Bem/Serviço',
                    productName: item.name || item.product?.name || 'Venda de Bem/Serviço',
                    productCode: item.productCode || item.product?.sku || 'N/A',
                    discount: Number(item.discount || 0),
                    deletedAt: null
                };
            });

            // Gerar próximo número sequencial (ex: FT 2026/0001)
            const number = await InvoiceModel.getNextInvoiceNumber(companyId, type || 'FT');

            // Datas AGT
            const issueDateObj = issueDate ? new Date(issueDate) : new Date();
            const dueDateObj = dueDate ? new Date(dueDate) : new Date(new Date().setDate(issueDateObj.getDate() + 30));

            // Fatura Recibo (FR) ou Recibo (RC) são liquidados no ato
            const status = (type === 'FR' || type === 'RC') ? 'PAID' : 'PENDING';

            const newInvoice = await InvoiceModel.createInvoice(
                {
                    companyId,
                    clientId: clientId || null,
                    customerName: customerName || null,
                    customerNif: customerNif || null,
                    customerAddress: customerAddress || null,
                    type: type || 'FT',
                    number,
                    status,
                    issueDate: issueDateObj,
                    dueDate: dueDateObj,
                    totalAmount: totalAmount + totalVat,
                    totalVat,
                    hash: null, // Será gerado dentro do model
                    hashControl: null,
                    systemEntryDate: new Date(),
                    invoiceStatusDate: new Date(),
                    keyVersion: 1,
                    sourceBilling: 'P'
                } as any,
                parsedItems
            );

            res.status(201).json(newInvoice);

            // Audit Log
            AuditService.log({
                companyId,
                userId: req.user?.id,
                action: 'CREATE_INVOICE',
                entity: 'Invoice',
                entityId: newInvoice.id,
                details: `Documento ${newInvoice.number} assinado e emitido com sucesso (${type})`
            });
        } catch (error: any) {
            console.error('[InvoiceController] Erro na emissão:', error);
            res.status(500).json({ error: error.message || 'Falha interna ao emitir fatura' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;
            const { type, issueDate, dueDate, items, clientId, customerName, customerNif, customerAddress } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Fatura sem itens não é permitida' });
            }

            let totalAmount = 0;
            let totalVat = 0;

            const parsedItems = items.map((item: any) => {
                const quantity = Number(item.quantity) || 1;
                const unitPrice = Number(item.price) || 0;
                const vatRate = Number(item.vatRate) || 0;
                
                const lineTotal = quantity * unitPrice;
                const lineVat = lineTotal * (vatRate / 100);

                totalAmount += lineTotal;
                totalVat += lineVat;

                return {
                    productId: item.productId || null,
                    quantity,
                    unitPrice,
                    vatRate,
                    totalAmount: lineTotal + lineVat,
                    description: item.name || 'Serviço GERAL',
                    productName: item.name || 'Serviço GERAL',
                    productCode: item.productCode || 'N/A',
                    discount: Number(item.discount || 0),
                    deletedAt: null
                };
            });

            // Update main record & recreate items inside a transaction
            const updatedInvoice = await prisma.$transaction(async (tx) => {
                // Delete old items
                await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

                // Update invoice
                const inv = await tx.invoice.update({
                    where: { id },
                    data: {
                        type: type || 'FT',
                        clientId: clientId || null,
                        customerName: customerName || null,
                        customerNif: customerNif || null,
                        customerAddress: customerAddress || null,
                        issueDate: issueDate ? new Date(issueDate) : new Date(),
                        dueDate: dueDate ? new Date(dueDate) : new Date(),
                        totalAmount: totalAmount + totalVat,
                        totalVat,
                        items: {
                            create: parsedItems.map(item => ({
                                ...item,
                                ...(item.productId ? { product: { connect: { id: item.productId } } } : { productId: null })
                            }))
                        }
                    },
                    include: { items: true, client: true }
                });
                return inv;
            });

            res.json(updatedInvoice);

            AuditService.log({
                companyId,
                userId: req.user?.id,
                action: 'UPDATE_INVOICE',
                entity: 'Invoice',
                entityId: id,
                details: `Documento ${updatedInvoice.number} alterado manualmente.`
            });
        } catch (error: any) {
            console.error('[InvoiceController] Erro ao editar:', error);
            res.status(500).json({ error: error.message || 'Falha interna ao editar fatura' });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;
            const { status } = req.body;

            if (!status || !['DRAFT', 'FINAL', 'PAID', 'CANCELLED'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const updatedInvoice = await InvoiceModel.updateInvoiceStatus(id, companyId, status);
            if (!updatedInvoice) return res.status(404).json({ error: 'Invoice not found' });

            res.json(updatedInvoice);

            // Audit
            AuditService.log({
                companyId,
                userId: req.user?.id,
                action: 'UPDATE_INVOICE_STATUS',
                entity: 'Invoice',
                entityId: id,
                details: `Estado da fatura ${updatedInvoice.number} alterado para ${status}`
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while updating invoice' });
        }
    }

    static async destroy(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;

            const success = await InvoiceModel.deleteInvoice(id, companyId);
            if (!success) return res.status(404).json({ error: 'Invoice not found or already deleted' });

            res.json({ message: 'Invoice deleted successfully' });

            // Audit
            AuditService.log({
                companyId,
                userId: req.user?.id,
                action: 'DELETE_INVOICE',
                entity: 'Invoice',
                entityId: id,
                details: `Fatura removida do sistema`
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while deleting invoice' });
        }
    }

    static async showPublic(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const invoice = await prisma.invoice.findUnique({
                where: { id },
                include: {
                    company: { select: { name: true, nif: true, address: true, logo: true } },
                    client: { select: { name: true, nif: true, address: true } },
                    items: {
                        include: { product: { select: { name: true } } }
                    }
                }
            });

            if (!invoice) return res.status(404).json({ error: 'Documento não encontrado para verificação pública.' });
            
            // Return safe data for public view
            res.json(invoice);
        } catch (error) {
            console.error('[PublicView] Error:', error);
            res.status(500).json({ error: 'Falha ao autenticar documento fiscal.' });
        }
    }
}

