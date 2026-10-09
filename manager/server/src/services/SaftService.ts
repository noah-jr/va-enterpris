import prisma from '../lib/prisma';
import { create } from 'xmlbuilder2';
import { SigningService } from './SigningService';
import { Client, Product, Invoice, InvoiceItem, Payment } from '@prisma/client';

type InvoiceWithItems = Invoice & {
    items: (InvoiceItem & { product?: Product | null })[];
    client?: Client | null;
    payments?: Payment[];
};

export interface FiscalSummary {
    year: number;
    month?: number;
    certificateNumber: string;
    invoiceCount: number;
    clientCount: number;
    productCount: number;
    totalRevenue: number;
    totalVatCharged: number;    // IVA Liquidado (saídas)
    totalVatDeductible: number; // IVA Dedutível estimado (entradas via despesas)
    stampTax: number;           // Imposto de Selo (0.3% sobre total)
    netVatDue: number;          // IVA a pagar (liquidado - dedutível)
    cancelledInvoices: number;
    activeInvoices: number;
}

/**
 * Mapeamento do tipo interno de documento para o código SAF-T(AO) InvoiceType:
 * FT = Fatura; NC = Nota de Crédito; ND = Nota de Débito; FR = Fatura Recibo; PP = Pró-forma
 */
function mapInvoiceType(type: string): string {
    const map: Record<string, string> = {
        FT: 'FT',
        FR: 'FR',
        NC: 'NC',
        ND: 'ND',
        PP: 'PP',
        RC: 'RC'
    };
    return map[type] || 'FT';
}

/**
 * Determina o código de isenção fiscal (TaxCode) para uma taxa.
 * NOR = Normal (taxa padrão); INT = Intermediária; RED = Reduzida; ISE = Isenta.
 */
function mapTaxCode(vatRate: number): string {
    if (vatRate === 0) return 'ISE';
    if (vatRate <= 5) return 'RED';
    if (vatRate <= 10) return 'INT';
    return 'NOR';
}

/**
 * Retorna o motivo de isenção padrão quando a taxa é 0%.
 */
function getTaxExemptionReason(vatRate: number): string | null {
    if (vatRate === 0) return 'M40'; // Isento - artigo 12.º do CIVA
    return null;
}

/**
 * SaftService — Gerador do ficheiro SAF-T (AO) versão 1.01_01
 *
 * Implementa o Decreto Executivo sobre Validação de Sistemas de Processamento Electrónico
 * de Facturação, Anexo I, Pontos 1, 10.
 *
 * Tabelas incluídas no ficheiro de facturação (conforme Ponto 10 do Anexo I):
 * - 1. Cabeçalho (Header)
 * - 2.2. Tabela de Clientes (Customer)
 * - 2.4. Tabela de Produtos (Product)
 * - 4.1. Documentos Comerciais a Clientes (SalesInvoices)
 * - 4.4. Documentos de Recibos emitidos (Payments)
 */
export class SaftService {

    /**
     * Gera o ficheiro XML SAF-T(AO) para um dado período fiscal.
     *
     * @param companyId - ID da empresa
     * @param fiscalYear - Ano fiscal (ex: 2026)
     * @param month - Mês opcional para extracção mensal (1-12). Se omitido, exporta o ano completo.
     */
    static async generateSaft(companyId: string, fiscalYear: number, month?: number): Promise<string> {
        // Calcular datas de início e fim do período
        let startDate: Date;
        let endDate: Date;

        if (month && month >= 1 && month <= 12) {
            // Exportação mensal (conforme Ponto 10 do Anexo I: pode ser fracionada por mês/dia)
            startDate = new Date(fiscalYear, month - 1, 1, 0, 0, 0);
            endDate = new Date(fiscalYear, month, 0, 23, 59, 59); // último dia do mês
        } else {
            startDate = new Date(`${fiscalYear}-01-01T00:00:00`);
            endDate = new Date(`${fiscalYear}-12-31T23:59:59`);
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                // Ponto 10 do Anexo I: clientes que tiveram transações no período
                invoices: {
                    where: {
                        issueDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    include: {
                        items: { include: { product: true } },
                        client: true,
                        payments: true
                    }
                }
            }
        });

        if (!company) throw new Error('Empresa não encontrada na base de dados');

        // Obter clientes que transacionaram no período (Ponto 10 do Anexo I)
        const activeClientIds = new Set(
            (company.invoices as any[]).map(inv => inv.clientId).filter(id => id !== null) as string[]
        );
        const activeClients = await prisma.client.findMany({
            where: {
                companyId,
                id: { in: Array.from(activeClientIds) }
            }
        });

        // Obter produtos referenciados nas faturas do período
        const activeProductCodes = new Set<string>();
        (company.invoices as InvoiceWithItems[]).forEach(inv => {
            inv.items.forEach(item => {
                if (item.product) activeProductCodes.add(item.product.code);
            });
        });
        const activeProducts = await prisma.product.findMany({
            where: {
                companyId,
                code: { in: Array.from(activeProductCodes) }
            }
        });

        const invoices = company.invoices as InvoiceWithItems[];

        // Separar faturas por tipo: documentos de venda (4.1) vs documentos de recibo (4.4)
        const salesInvoices = invoices.filter(inv =>
            ['FT', 'FR', 'NC', 'ND', 'PP'].includes(inv.type)
        );
        const receiptDocs = invoices.filter(inv => inv.type === 'RC');

        // Calcular totais para SalesInvoices
        const totalCreditSales = salesInvoices
            .filter(inv => inv.status !== 'CANCELLED')
            .filter(inv => inv.type !== 'NC')
            .reduce((acc, inv) => acc + inv.totalAmount, 0);

        const totalDebitSales = salesInvoices
            .filter(inv => inv.status !== 'CANCELLED')
            .filter(inv => inv.type === 'NC')
            .reduce((acc, inv) => acc + inv.totalAmount, 0);

        const dateCreated = new Date();
        const periodStr = month
            ? `${fiscalYear}-${String(month).padStart(2, '0')}`
            : `${fiscalYear}`;

        // Construção do objecto XML SAF-T(AO) v1.01_01
        const auditFile: any = {
            AuditFile: {
                '@xmlns': 'urn:OECD:StandardAuditFile-Tax:AO:1.01_01',
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',

                // ---------------------------------------------------------------
                // Tabela 1: Cabeçalho (Header)
                // ---------------------------------------------------------------
                Header: {
                    AuditFileVersion: '1.01_01',
                    CompanyID: company.nif,
                    TaxRegistrationNumber: company.nif,
                    TaxAccountingBasis: 'I',    // I = Faturação
                    CompanyName: company.name,
                    BusinessName: company.name,
                    CompanyAddress: {
                        AddressDetail: company.address || 'N/D',
                        City: 'Luanda',
                        Province: 'Luanda',
                        Country: 'AO'
                    },
                    FiscalYear: fiscalYear,
                    StartDate: startDate.toISOString().split('T')[0],
                    EndDate: endDate.toISOString().split('T')[0],
                    CurrencyCode: 'AOA',
                    DateCreated: dateCreated.toISOString().split('T')[0],
                    TaxEntity: 'Global',
                    ProductCompanyID: process.env.SOFTWARE_COMPANY_ID || 'VA-SOFTWARE-SOLUTIONS-LDA',
                    SoftwareCertificateNumber: SigningService.getCertificateNumber(),
                    ProductID: 'VA OneGest Sovereign OS',
                    ProductVersion: '4.2'
                },

                // ---------------------------------------------------------------
                // Tabela 2: Ficheiros mestre
                // ---------------------------------------------------------------
                MasterFiles: {
                    // Tabela 2.2: Clientes que transacionaram no período
                    Customer: [
                        ...activeClients.map(client => ({
                            CustomerID: client.id,
                            AccountID: 'Desconhecido',
                            CustomerTaxID: client.nif || '999999990',
                            CompanyName: client.name,
                            Contact: client.name,
                            BillingAddress: {
                                AddressDetail: client.address || 'N/D',
                                City: 'Luanda',
                                Country: 'AO'
                            },
                            ShipToAddress: {
                                AddressDetail: client.address || 'N/D',
                                City: 'Luanda',
                                Country: 'AO'
                            },
                            Telephone: client.phone || '',
                            Email: client.email || '',
                            SelfBillingIndicator: 0
                        })),
                        // Adicionar Consumidor Final se houver faturas sem clientId
                        ...(invoices.some(inv => !inv.clientId) ? [{
                            CustomerID: 'CONSUMIDOR_FINAL',
                            AccountID: 'Desconhecido',
                            CustomerTaxID: '999999999',
                            CompanyName: 'CONSUMIDOR FINAL',
                            Contact: 'CONSUMIDOR FINAL',
                            BillingAddress: { AddressDetail: 'N/D', City: 'Luanda', Country: 'AO' },
                            ShipToAddress: { AddressDetail: 'N/D', City: 'Luanda', Country: 'AO' },
                            SelfBillingIndicator: 0
                        }] : [])
                    ],

                    // Tabela 2.4: Produtos/serviços referenciados no período
                    Product: [
                        ...activeProducts.map(product => ({
                            ProductType: product.type === 'SERVICE' ? 'S' : 'P',
                            ProductCode: product.code,
                            ProductGroup: product.category || 'DIVERSOS',
                            ProductDescription: product.description || product.name,
                            ProductNumberCode: product.code
                        })),
                        // Produto Genérico para itens sem ID (performance/ad-hoc)
                        ...(invoices.some(inv => inv.items.some(it => !it.productId)) ? [{
                            ProductType: 'P',
                            ProductCode: 'P000',
                            ProductGroup: 'DIVERSOS',
                            ProductDescription: 'PRODUTO OU SERVIÇO DE TEXTO LIVRE',
                            ProductNumberCode: 'P000'
                        }] : [])
                    ]
                },

                // ---------------------------------------------------------------
                // Tabela 4: Documentos de origem (SourceDocuments)
                // ---------------------------------------------------------------
                SourceDocuments: {
                    // ---------------------------------------------------------------
                    // Tabela 4.1: Documentos Comerciais a Clientes (SalesInvoices)
                    // ---------------------------------------------------------------
                    ...(salesInvoices.length > 0 && {
                        SalesInvoices: {
                            NumberOfEntries: salesInvoices.length,
                            TotalDebit: totalDebitSales.toFixed(2),
                            TotalCredit: totalCreditSales.toFixed(2),
                            Invoice: salesInvoices.map(invoice => {
                                const inv = invoice as InvoiceWithItems;
                                const issueDateStr = new Date(inv.issueDate).toISOString().split('T')[0];
                                const systemEntryDateStr = new Date(inv.systemEntryDate || inv.createdAt)
                                    .toISOString().replace('T', 'T').slice(0, 19);
                                const statusDateStr = new Date(inv.invoiceStatusDate || inv.updatedAt)
                                    .toISOString().slice(0, 19);

                                // Agrupar linhas por taxa de IVA para o resumo fiscal
                                const taxGroups = this._groupLinesByTax(inv.items);

                                const invoiceDoc: any = {
                                    InvoiceNo: inv.number,

                                    // Estado do documento (Ponto 4 do Anexo I)
                                    DocumentStatus: {
                                        InvoiceStatus: inv.status === 'CANCELLED' ? 'A' : 'N',
                                        InvoiceStatusDate: statusDateStr,
                                        Reason: inv.status === 'CANCELLED' ? 'Anulado pelo utilizador' : undefined,
                                        SourceID: 'API', // Utilizador do sistema
                                        SourceBilling: inv.sourceBilling || 'P'
                                    },

                                    // Assinatura digital (Ponto 5 do Anexo I)
                                    Hash: inv.hash || '0', // "0" se não assinado (ponto 5f)
                                    HashControl: inv.hashControl || SigningService.getHashControl(),
                                    Period: new Date(inv.issueDate).getMonth() + 1,
                                    InvoiceDate: issueDateStr,
                                    InvoiceType: mapInvoiceType(inv.type),
                                    SpecialRegimes: {
                                        SelfBillingIndicator: 0,
                                        CashVATSchemeIndicator: 0,
                                        ThirdPartiesBillingIndicator: 0
                                    },
                                    SystemEntryDate: systemEntryDateStr,
                                    CustomerID: inv.clientId || 'CONSUMIDOR_FINAL',

                                    // Linhas do documento
                                    Line: inv.items.map((item, idx) => {
                                        const netAmount = item.quantity * item.unitPrice;
                                        const creditOrDebit = inv.type === 'NC'
                                            ? { DebitAmount: netAmount.toFixed(2) }
                                            : { CreditAmount: netAmount.toFixed(2) };

                                        const taxCode = mapTaxCode(item.vatRate);
                                        const exemptionReason = getTaxExemptionReason(item.vatRate);

                                        return {
                                            LineNumber: idx + 1,
                                            ProductCode: item.product?.code || 'P000',
                                            ProductDescription: item.description || item.product?.description || item.product?.name || 'Venda de Bem/Serviço',
                                            Quantity: item.quantity,
                                            UnitOfMeasure: (item.product as any)?.unit || 'UN',
                                            UnitPrice: item.unitPrice.toFixed(2),
                                            TaxPointDate: issueDateStr,
                                            References: undefined, // Para NC/ND: referência à fatura original
                                            Description: item.description || item.product?.name || 'Venda de Bem/Serviço',
                                            ...creditOrDebit,
                                            ...(item.discount > 0 && {
                                                SettlementAmount: (netAmount * (item.discount / 100)).toFixed(2)
                                            }),
                                            Tax: {
                                                TaxType: 'IVA',
                                                TaxCountryRegion: 'AO',
                                                TaxCode: taxCode,
                                                TaxPercentage: item.vatRate,
                                                ...(exemptionReason && { TaxExemptionReason: exemptionReason })
                                            }
                                        };
                                    }),

                                    // Totais do documento (Ponto 10f do Anexo I)
                                    DocumentTotals: {
                                        TaxPayable: inv.totalVat.toFixed(2),
                                        NetTotal: (inv.totalAmount - inv.totalVat).toFixed(2),
                                        GrossTotal: inv.totalAmount.toFixed(2)
                                    }
                                };

                                // Adicionar resumo por taxa fiscal (Webservice SOAP Body, campo 7)
                                if (taxGroups.length > 0) {
                                    invoiceDoc.DocumentTotals.Currency = undefined; // AOA é padrão

                                    // Tax summary lines por taxa
                                    const taxLineSummaries = taxGroups.map(group => ({
                                        TaxType: 'IVA',
                                        TaxCode: mapTaxCode(group.vatRate),
                                        TaxPercentage: group.vatRate,
                                        ...(inv.type === 'NC'
                                            ? { TaxAmount: group.taxAmount.toFixed(2), DebitAmount: group.netAmount.toFixed(2) }
                                            : { TaxAmount: group.taxAmount.toFixed(2), CreditAmount: group.netAmount.toFixed(2) })
                                    }));

                                    invoiceDoc.WithholdingTax = undefined;
                                }

                                return invoiceDoc;
                            })
                        }
                    }),

                    // ---------------------------------------------------------------
                    // Tabela 4.4: Documentos de Recibos (Payments)
                    // ---------------------------------------------------------------
                    ...(receiptDocs.length > 0 && {
                        Payments: {
                            NumberOfEntries: receiptDocs.length,
                            TotalDebit: '0.00',
                            TotalCredit: receiptDocs
                                .filter(r => r.status !== 'CANCELLED')
                                .reduce((acc, r) => acc + r.totalAmount, 0)
                                .toFixed(2),
                            Payment: receiptDocs.map(receipt => {
                                const issueDateStr = new Date(receipt.issueDate).toISOString().split('T')[0];
                                const systemEntryDateStr = new Date(receipt.systemEntryDate || receipt.createdAt)
                                    .toISOString().slice(0, 19);

                                return {
                                    PaymentRefNo: receipt.number,
                                    Period: new Date(receipt.issueDate).getMonth() + 1,
                                    TransactionDate: issueDateStr,
                                    PaymentType: 'RC',
                                    DocumentStatus: {
                                        PaymentStatus: receipt.status === 'CANCELLED' ? 'A' : 'N',
                                        PaymentStatusDate: new Date(receipt.invoiceStatusDate || receipt.updatedAt)
                                            .toISOString().slice(0, 19),
                                        SourceID: 'API',
                                        SourcePayment: receipt.sourceBilling || 'P'
                                    },
                                    Hash: receipt.hash || '0',
                                    HashControl: receipt.hashControl || SigningService.getHashControl(),
                                    SystemEntryDate: systemEntryDateStr,
                                    CustomerID: receipt.clientId || 'CONSUMIDOR_FINAL',
                                    Line: receipt.items.map((item, idx) => ({
                                        LineNumber: idx + 1,
                                        SourceDocumentID: {
                                            OriginatingON: receipt.number,
                                            InvoiceDate: issueDateStr,
                                            Description: item.description || (item as any).product?.name || 'Serviço'
                                        },
                                        SettlementAmount: '0.00',
                                        CreditAmount: (item.quantity * item.unitPrice).toFixed(2),
                                        Tax: {
                                            TaxType: 'IVA',
                                            TaxCountryRegion: 'AO',
                                            TaxCode: mapTaxCode(item.vatRate),
                                            TaxPercentage: item.vatRate
                                        }
                                    })),
                                    DocumentTotals: {
                                        TaxPayable: receipt.totalVat.toFixed(2),
                                        NetTotal: (receipt.totalAmount - receipt.totalVat).toFixed(2),
                                        GrossTotal: receipt.totalAmount.toFixed(2),
                                        Settlement: [{
                                            PaymentMechanism: 'OU' // OU = outros
                                        }]
                                    }
                                };
                            })
                        }
                    })
                }
            }
        };

        // Remover propriedades undefined recursivamente
        this._cleanUndefined(auditFile);

        return create(auditFile).end({ prettyPrint: true });
    }

    /**
     * Retorna o resumo fiscal para o módulo de Conformidade.
     */
    static async getFiscalSummary(companyId: string, fiscalYear: number, month?: number): Promise<FiscalSummary> {
        let startDate: Date;
        let endDate: Date;

        if (month && month >= 1 && month <= 12) {
            startDate = new Date(fiscalYear, month - 1, 1, 0, 0, 0);
            endDate = new Date(fiscalYear, month, 0, 23, 59, 59);
        } else {
            startDate = new Date(`${fiscalYear}-01-01T00:00:00`);
            endDate = new Date(`${fiscalYear}-12-31T23:59:59`);
        }

        const invoices = await prisma.invoice.findMany({
            where: {
                companyId,
                issueDate: { gte: startDate, lte: endDate }
            },
            include: { items: true }
        });

        const clientCount = await prisma.client.count({ where: { companyId } });
        const productCount = await prisma.product.count({ where: { companyId } });

        const activeInvoices = invoices.filter(inv => inv.status !== 'CANCELLED');
        const cancelledInvoices = invoices.filter(inv => inv.status === 'CANCELLED');

        const totalRevenue = activeInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
        const totalVatCharged = activeInvoices.reduce((acc, inv) => acc + inv.totalVat, 0);

        // IVA Dedutível estimado: 14% sobre despesas registadas no período
        const financialExpenses = await prisma.financialEntry.findMany({
            where: {
                companyId,
                type: 'EXPENSE',
                dueDate: { gte: startDate, lte: endDate }
            }
        });
        const totalExpenses = financialExpenses.reduce((acc, e) => acc + e.amount, 0);
        const totalVatDeductible = totalExpenses * 0.14;

        // Imposto de Selo: 0.3% sobre total de receita
        const stampTax = totalRevenue * 0.003;
        const netVatDue = Math.max(0, totalVatCharged - totalVatDeductible);

        return {
            year: fiscalYear,
            month,
            certificateNumber: SigningService.getCertificateNumber(),
            invoiceCount: invoices.length,
            clientCount,
            productCount,
            totalRevenue,
            totalVatCharged,
            totalVatDeductible,
            stampTax,
            netVatDue,
            cancelledInvoices: cancelledInvoices.length,
            activeInvoices: activeInvoices.length
        };
    }

    /**
     * Agrupa as linhas de uma fatura pelo código de taxa IVA.
     * Usado para o campo Line do Webservice SAFT e para validação interna.
     */
    private static _groupLinesByTax(items: (InvoiceItem & { product?: Product | null })[]): {
        vatRate: number;
        netAmount: number;
        taxAmount: number;
    }[] {
        const groups = new Map<number, { netAmount: number; taxAmount: number }>();

        items.forEach(item => {
            const net = item.quantity * item.unitPrice;
            const tax = net * (item.vatRate / 100);
            const existing = groups.get(item.vatRate) || { netAmount: 0, taxAmount: 0 };
            groups.set(item.vatRate, {
                netAmount: existing.netAmount + net,
                taxAmount: existing.taxAmount + tax
            });
        });

        return Array.from(groups.entries()).map(([vatRate, amounts]) => ({
            vatRate,
            ...amounts
        }));
    }

    /**
     * Remove propriedades `undefined` do objecto para evitar nós XML vazios.
     */
    private static _cleanUndefined(obj: any): void {
        if (typeof obj !== 'object' || obj === null) return;
        Object.keys(obj).forEach(key => {
            if (obj[key] === undefined) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                this._cleanUndefined(obj[key]);
            }
        });
    }
}
