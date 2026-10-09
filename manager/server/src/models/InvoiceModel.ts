import prisma from '../lib/prisma';
import { Invoice, InvoiceItem } from '@prisma/client';
import { SigningService } from '../services/SigningService';

// Complex return type for Invoices with Items included
export type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

export class InvoiceModel {
    static async getAllInvoices(companyId: string): Promise<any[]> {
        return prisma.invoice.findMany({
            where: { companyId },
            include: {
                items: {
                    include: { product: true }
                },
                client: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getInvoiceById(id: string, companyId: string): Promise<any | null> {
        return prisma.invoice.findFirst({
            where: { id, companyId },
            include: {
                items: {
                    include: { product: true }
                },
                client: true,
                company: true
            }
        });
    }

    /**
     * Cria uma fatura e assina-a imediatamente conforme Ponto 5 do Anexo I.
     *
     * Regra AGT:
     * - A assinatura é gerada no momento da criação do documento.
     * - O Hash depende dos dados do documento corrente e do Hash do último documento
     *   da mesma série/tipo (Ponto 5e).
     * - A assinatura é guardada na BD juntamente com a versão da chave privada (Ponto 5c).
     * - Nenhum documento pode ser impresso antes de ser devidamente assinado (Ponto 4k).
     */
    static async createInvoice(
        invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>,
        itemsData: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt' | 'updatedAt'>[],
        txClient?: any
    ): Promise<InvoiceWithItems> {
        const execute = async (tx: any) => {
            const { companyId, clientId, ...restData } = invoiceData;
            const now = new Date();

            // Ponto 5e: Obter hash do último documento da mesma série/tipo para encadeamento
            const lastSignedDoc = await tx.invoice.findFirst({
                where: {
                    companyId,
                    type: restData.type,
                    hash: { not: null }
                },
                orderBy: { systemEntryDate: 'desc' },
                select: { hash: true, number: true }
            });

            const previousHash = lastSignedDoc?.hash || null;

            // Gerar assinatura RSA-SHA1 do documento (Ponto 5a e 34 do Anexo I)
            const hash = SigningService.generateInvoiceHash(
                {
                    issueDate: restData.issueDate || now,
                    systemEntryDate: now,
                    number: restData.number,
                    totalAmount: restData.totalAmount
                },
                previousHash
            );

            // HashControl: número do certificado + versão da chave (Ponto 7d do Anexo I)
            const hashControl = SigningService.getHashControl();

            const invoice = await (tx.invoice as any).create({
                data: {
                    ...restData,
                    systemEntryDate: now,
                    invoiceStatusDate: now,
                    hash,
                    hashControl,
                    keyVersion: parseInt(SigningService.getKeyVersion(), 10),
                    sourceBilling: 'P', // P = Programa (emitido pelo próprio sistema)
                    company: { connect: { id: companyId } },
                    ...(clientId ? { client: { connect: { id: clientId } } } : {}),
                    items: {
                        create: itemsData.map(item => {
                            const { productId, ...itemRest } = item as any;
                            return {
                                ...itemRest,
                                ...(productId ? { product: { connect: { id: productId } } } : {})
                            };
                        })
                    }
                },
                include: { items: true }
            });

            return invoice as any;
        };

        if (txClient) return execute(txClient);
        return prisma.$transaction(execute);
    }

    /**
     * Actualiza o estado de uma fatura.
     * Conforme Ponto 4l do Anexo I: não permite alterar campos fiscalmente relevantes
     * de documentos já assinados.
     */
    static async updateInvoiceStatus(id: string, companyId: string, status: string): Promise<Invoice | null> {
        const existing = await prisma.invoice.findFirst({ where: { id, companyId } });
        if (!existing) return null;

        // Ponto 4l: Não pode alterar informação fiscalmente relevante de documentos já assinados.
        // O estado pode ser alterado, mas mantemos o hash original.
        return prisma.invoice.update({
            where: { id },
            data: {
                status,
                invoiceStatusDate: new Date(),
                updatedAt: new Date()
            }
        });
    }

    /**
     * Gera o próximo número de documento sequencial conforme Ponto 4g do Anexo I.
     *
     * Formato: "[Tipo] [Série]/[Número]"
     * Exemplo: "FT 2026/0001"
     *
     * Regra AGT:
     * - Numeração sequencial e contínua dentro de cada série.
     * - Não podem ser utilizados caracteres que violem o esquema XML (Ponto 4h).
     * - O código da série é específico de cada estabelecimento (Ponto 4i).
     */
    static async getNextInvoiceNumber(companyId: string, type: string, txClient?: any): Promise<string> {
        const currentYear = new Date().getFullYear();
        // Série padrão: "[Tipo] [ANO]" — ex: "FT 2026"
        const seriesPrefix = `${type} ${currentYear}/`;

        const ctx = txClient || prisma;
        const lastInvoice = await (ctx.invoice as any).findFirst({
            where: {
                companyId,
                type,
                number: { startsWith: seriesPrefix }
            },
            orderBy: { systemEntryDate: 'desc' }
        });

        let nextSequence = 1;
        if (lastInvoice) {
            const parts = lastInvoice.number.split('/');
            const lastSeq = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
        }

        // Formato: "FT 2026/0001" (4 dígitos mínimo)
        return `${type} ${currentYear}/${nextSequence.toString().padStart(4, '0')}`;
    }


    /**
     * Elimina uma fatura. Conforme Ponto 4j: apenas séries descontinuadas podem ser inibidas,
     * não se pode apagar informação. Em ambiente de desenvolvimento, permitimos eliminação.
     * Em produção, deveria apenas anular (status = 'CANCELLED').
     */
    static async deleteInvoice(id: string, companyId: string): Promise<boolean> {
        const existing = await prisma.invoice.findFirst({ where: { id, companyId } });
        if (!existing) return false;

        await prisma.$transaction([
            prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
            prisma.invoice.delete({ where: { id } })
        ]);

        return true;
    }
}
