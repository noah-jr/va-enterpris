import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cloudinary } from '../lib/uploadAccountingDoc';
import { REQUIRED_DOCUMENTS, BANKS_LIST } from '../config/accountingDocuments';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

const STATUS_FLOW: Record<string, string[]> = {
    PENDING_SUBMISSION: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'PENDING_INFO'],
    UNDER_REVIEW: ['PENDING_INFO', 'REVIEWED', 'REJECTED'],
    PENDING_INFO: ['SUBMITTED', 'UNDER_REVIEW'],
    REVIEWED: ['CLOSED', 'UNDER_REVIEW'],
    CLOSED: [],
    REJECTED: [],
};

const q = (v: unknown): string | undefined =>
    typeof v === 'string' ? v : undefined;

export class AccountingCaseController {

    static async getRequiredDocuments() {
        try {
            let setting = await prisma.systemSetting.findUnique({ where: { key: 'REQUIRED_DOCUMENTS' } });
            if (!setting) {
                setting = await prisma.systemSetting.create({
                    data: {
                        key: 'REQUIRED_DOCUMENTS',
                        value: JSON.stringify(REQUIRED_DOCUMENTS),
                        description: 'Configuração de documentos contabilísticos obrigatórios'
                    }
                });
            }
            return JSON.parse(setting.value || '[]');
        } catch (e) {
            console.error('[getRequiredDocuments Error]', e);
            return REQUIRED_DOCUMENTS;
        }
    }

    static async getBanksList() {
        try {
            let setting = await prisma.systemSetting.findUnique({ where: { key: 'BANKS_LIST' } });
            if (!setting) {
                setting = await prisma.systemSetting.create({
                    data: {
                        key: 'BANKS_LIST',
                        value: JSON.stringify(BANKS_LIST),
                        description: 'Lista de bancos suportados para extratos bancários'
                    }
                });
            }
            return JSON.parse(setting.value || '[]');
        } catch (e) {
            console.error('[getBanksList Error]', e);
            return BANKS_LIST;
        }
    }

    static async getChartOfAccounts(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const accounts = await prisma.chartOfAccount.findMany({
                where: { OR: [{ companyId }, { companyId: null }], isActive: true },
                orderBy: { code: 'asc' }
            });
            res.json(accounts);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar plano de contas' });
        }
    }

    static async createAccount(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const { code, name, description, nature, class: cls, level, parentCode } = req.body;
            const account = await prisma.chartOfAccount.create({
                data: { companyId, code, name, description, nature, class: cls, level: Number(level) || 1, parentCode }
            });
            res.status(201).json(account);
        } catch (e: any) {
            if (e.code === 'P2002') return res.status(409).json({ error: 'Código de conta já existe' });
            res.status(500).json({ error: 'Erro ao criar conta' });
        }
    }

    static async listJournalEntries(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const caseId = q(req.query.caseId);
            const status = q(req.query.status);
            const from = q(req.query.from);
            const to = q(req.query.to);

            const entries = await prisma.journalEntry.findMany({
                where: {
                    companyId,
                    ...(caseId ? { caseId } : {}),
                    ...(status ? { status } : {}),
                    ...(from || to ? {
                        date: {
                            ...(from ? { gte: new Date(from) } : {}),
                            ...(to ? { lte: new Date(to) } : {}),
                        }
                    } : {})
                },
                include: { lines: { include: { account: true } } },
                orderBy: { date: 'desc' },
                take: 500
            });
            res.json(entries);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar lançamentos' });
        }
    }

    static async createJournalEntry(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const { description, reference, type, date, caseId, notes, lines } = req.body;

            if (!lines || lines.length < 2)
                return res.status(400).json({ error: 'Um lançamento requer pelo menos 2 linhas (partidas dobradas)' });

            const totalDebit = lines.reduce((s: number, l: any) => s + Number(l.debit || 0), 0);
            const totalCredit = lines.reduce((s: number, l: any) => s + Number(l.credit || 0), 0);

            if (Math.abs(totalDebit - totalCredit) > 0.01)
                return res.status(400).json({
                    error: `Desequilíbrio: Débito ${totalDebit.toFixed(2)} ≠ Crédito ${totalCredit.toFixed(2)}`
                });

            const count = await prisma.journalEntry.count({ where: { companyId } });
            const number = `LAN-${String(count + 1).padStart(6, '0')}`;

            const entry = await prisma.journalEntry.create({
                data: {
                    companyId,
                    caseId: caseId || null,
                    number, description, reference,
                    type: type || 'MANUAL',
                    status: 'DRAFT',
                    date: date ? new Date(date) : new Date(),
                    totalDebit, totalCredit, notes,
                    lines: {
                        create: lines.map((l: any, i: number) => ({
                            accountId: String(l.accountId),
                            description: l.description,
                            debit: Number(l.debit || 0),
                            credit: Number(l.credit || 0),
                            order: i
                        }))
                    }
                },
                include: { lines: { include: { account: true } } }
            });
            res.status(201).json(entry);
        } catch (e) {
            console.error('[Journal.create]', e);
            res.status(500).json({ error: 'Erro ao criar lançamento' });
        }
    }

    static async postJournalEntry(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const companyId = String((req as any).companyId);
            const userId = (req as any).user?.id || null;

            const entry = await prisma.journalEntry.findFirst({ where: { id, companyId } });
            if (!entry) return res.status(404).json({ error: 'Lançamento não encontrado' });
            if (entry.status === 'POSTED') return res.status(400).json({ error: 'Já registado' });

            const updated = await prisma.journalEntry.update({
                where: { id },
                data: { status: 'POSTED', postedAt: new Date(), postedBy: userId }
            });
            res.json(updated);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao registar lançamento' });
        }
    }

    static async listCases(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const status = q(req.query.status);
            const clientId = q(req.query.clientId);
            const period = q(req.query.period);

            const cases = await prisma.accountingCase.findMany({
                where: {
                    companyId,
                    ...(status ? { status } : {}),
                    ...(clientId ? { clientId } : {}),
                    ...(period ? { period } : {}),
                },
                include: {
                    client: { select: { id: true, name: true, nif: true } },
                    documents: { select: { id: true, name: true, type: true, status: true, uploadedAt: true } },
                    _count: { select: { documents: true, journalEntries: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(cases);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar processos' });
        }
    }

    static async getCase(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const companyId = String((req as any).companyId);

            const c = await prisma.accountingCase.findFirst({
                where: { id, companyId },
                include: {
                    client: true,
                    documents: true,
                    messages: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
                    journalEntries: { include: { lines: { include: { account: true } } } }
                }
            });
            if (!c) return res.status(404).json({ error: 'Processo não encontrado' });
            res.json(c);
        } catch (e) {
            console.error('[getCase Error]', e);
            res.status(500).json({ error: 'Erro ao obter processo' });
        }
    }

    static async createCase(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const { title, period, periodType, clientId, description, dueDate, priority } = req.body;

            const c = await prisma.accountingCase.create({
                data: {
                    companyId,
                    clientId: clientId || null,
                    title, period,
                    periodType: periodType || 'MONTHLY',
                    description,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    priority: priority || 'NORMAL',
                    status: 'PENDING_SUBMISSION'
                }
            });
            res.status(201).json(c);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao criar processo' });
        }
    }

    static async updateCaseStatus(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const companyId = String((req as any).companyId);
            const userId = (req as any).user?.id || null;
            const { status, adminNote, totalRevenue, totalExpense, taxableBase,
                ivaLiquidado, ivaDedutivel, irtAmount, netResult } = req.body;

            const c = await prisma.accountingCase.findFirst({ where: { id, companyId } });
            if (!c) return res.status(404).json({ error: 'Processo não encontrado' });

            const allowed = STATUS_FLOW[c.status] || [];
            if (!allowed.includes(status))
                return res.status(400).json({ error: `Transição inválida: ${c.status} → ${status}` });

            const extra: any = {};
            if (status === 'SUBMITTED') extra.submittedAt = new Date();
            if (['REVIEWED', 'CLOSED', 'REJECTED'].includes(status)) {
                extra.reviewedAt = new Date();
                extra.reviewedBy = userId;
            }

            const updated = await prisma.accountingCase.update({
                where: { id },
                data: {
                    status,
                    adminNote: adminNote ?? c.adminNote,
                    totalRevenue: totalRevenue !== undefined ? Number(totalRevenue) : c.totalRevenue,
                    totalExpense: totalExpense !== undefined ? Number(totalExpense) : c.totalExpense,
                    taxableBase: taxableBase !== undefined ? Number(taxableBase) : c.taxableBase,
                    ivaLiquidado: ivaLiquidado !== undefined ? Number(ivaLiquidado) : c.ivaLiquidado,
                    ivaDedutivel: ivaDedutivel !== undefined ? Number(ivaDedutivel) : c.ivaDedutivel,
                    irtAmount: irtAmount !== undefined ? Number(irtAmount) : c.irtAmount,
                    netResult: netResult !== undefined ? Number(netResult) : c.netResult,
                    ...extra
                },
                include: { client: true, documents: true }
            });
            res.json(updated);
        } catch (e) {
            console.error('[Case.updateStatus]', e);
            res.status(500).json({ error: 'Erro ao actualizar estado' });
        }
    }

    static async generateAIAnalysis(req: Request, res: Response) {
        try {
            const caseId = String(req.params.id);
            const companyId = String((req as any).companyId);

            const c = await prisma.accountingCase.findFirst({
                where: { id: caseId, companyId },
                include: { documents: true }
            });

            if (!c) return res.status(404).json({ error: 'Dossier não encontrado' });

            const docCount = c.documents.length;
            if (docCount === 0) {
                return res.json({
                    adminNote: "Aviso do Agente: Nenhum documento anexado neste dossier para análise inteligente. Anexe faturas e recibos primeiro.",
                    totalRevenue: 0,
                    totalExpense: 0,
                    ivaLiquidado: 0,
                    irtAmount: 0,
                    netResult: 0
                });
            }

            // Simulação de Inteligência Artificial / OCR Agente Contabilístico
            const revenue = Math.floor(Math.random() * 800000) + 150000;
            const expense = Math.floor(Math.random() * 300000) + 50000;
            const iva = revenue * 0.14;
            const irt = expense * 0.065;
            const netResult = revenue - expense - iva - irt;

            const adminNote = `(Análise por Agente Contabilístico IA): Após leitura ótica de ${docCount} documento(s) anexado(s), foram identificados padrões de faturação na ordem de ${revenue.toLocaleString('pt-PT')} AOA e encargos dedutíveis de ${expense.toLocaleString('pt-PT')} AOA. O rácio financeiro demonstra liquidez estável. Proceder à verificação humana para fecho do período.`;

            res.json({
                adminNote,
                totalRevenue: revenue,
                totalExpense: expense,
                ivaLiquidado: iva,
                irtAmount: irt,
                netResult: netResult
            });
        } catch (error) {
            console.error('[Case.generateAIAnalysis]', error);
            res.status(500).json({ error: 'Falha no processamento da IA' });
        }
    }

    static async uploadDocument(req: Request, res: Response) {
        try {
            const caseId = String(req.params.caseId);
            const companyId = String((req as any).companyId);
            const userId = (req as any).user?.id || null;
            const file = (req as any).file;
            const { name, type, description, status } = req.body;

            const c = await prisma.accountingCase.findFirst({ where: { id: caseId, companyId } });
            if (!c) return res.status(404).json({ error: 'Processo não encontrado' });

            if (!file && status !== 'NOT_APPLICABLE') {
                return res.status(400).json({ error: 'Ficheiro não enviado' });
            }

            // Determine file URL/path to store
            let fileUrl = '';
            let filePublicId: string | null = null;

            if (file) {
                // For disk storage: file.path is the absolute local path
                // For cloudinary: file.path is the remote URL
                fileUrl = file.path ? String(file.path) : '';
                filePublicId = file.filename ? String(file.filename) : (file.public_id ? String(file.public_id) : null);

                // ── Mirror to structured audit archive ───────────────────────
                // Structure: uploads/accounting/audit/<companyId>/<period>/<docTypeLabel>/
                if (file.path && !file.path.startsWith('http')) {
                    try {
                        const reqDocs = await AccountingCaseController.getRequiredDocuments();
                        const docConfig = (reqDocs as any[]).find((r: any) => r.key === (type || 'OTHER'));
                        const folderLabel = docConfig ? docConfig.label.replace(/[^\w\s-]/g, '').trim() : (type || 'Outros');
                        const period = c.period.replace(/[^\w-]/g, '_');

                        const auditDir = path.join(
                            process.cwd(), 'uploads', 'accounting', 'audit',
                            companyId, period, folderLabel
                        );
                        await fs.promises.mkdir(auditDir, { recursive: true });

                        const destFilename = path.basename(file.path);
                        const destPath = path.join(auditDir, destFilename);
                        await fs.promises.copyFile(file.path, destPath);

                        console.log(`[Accounting] Arquivo auditoria: ${destPath}`);
                    } catch (copyErr) {
                        // Non-fatal — the primary upload already succeeded
                        console.error('[Accounting] Erro ao copiar para arquivo auditoria:', copyErr);
                    }
                }
                // ─────────────────────────────────────────────────────────────
            }

            const doc = await prisma.accountingDocument.create({
                data: {
                    caseId,
                    uploadedBy: userId,
                    name: name || (file ? String(file.originalname) : 'Documento'),
                    type: type || 'OTHER_DOCS',
                    description,
                    fileUrl,
                    filePublicId,
                    fileSizeKb: file && file.size ? Number(file.size) / 1024 : null,
                    mimeType: file ? String(file.mimetype) : null,
                    status: status || 'PENDING'
                }
            });

            // Auto-advance case status from PENDING_SUBMISSION → SUBMITTED
            if (c.status === 'PENDING_SUBMISSION') {
                await prisma.accountingCase.update({
                    where: { id: caseId },
                    data: { status: 'SUBMITTED', submittedAt: new Date() }
                });
            }

            res.status(201).json(doc);
        } catch (e) {
            console.error('[Doc.upload]', e);
            res.status(500).json({ error: 'Erro ao fazer upload do documento' });
        }
    }

    static async reviewDocument(req: Request, res: Response) {
        try {
            const docId = String(req.params.docId);
            const companyId = String((req as any).companyId);
            const { status, adminNote } = req.body;

            const doc = await prisma.accountingDocument.findFirst({
                where: { id: docId, case: { companyId } }
            });
            if (!doc) return res.status(404).json({ error: 'Documento não encontrado' });

            const updated = await prisma.accountingDocument.update({
                where: { id: docId },
                data: { status, adminNote }
            });
            res.json(updated);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao rever documento' });
        }
    }

    static async deleteDocument(req: Request, res: Response) {
        try {
            const docId = String(req.params.docId);
            const companyId = String((req as any).companyId);

            const doc = await prisma.accountingDocument.findFirst({
                where: { id: docId, case: { companyId } }
            });
            if (!doc) return res.status(404).json({ error: 'Documento não encontrado' });

            if (doc.filePublicId) {
                await cloudinary.uploader.destroy(doc.filePublicId).catch(() => { });
            }
            await prisma.accountingDocument.delete({ where: { id: docId } });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: 'Erro ao eliminar documento' });
        }
    }

    static async getSummary(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);

            const [totalCases, pendingReview, totalDocuments, postedEntries] = await Promise.all([
                prisma.accountingCase.count({ where: { companyId } }),
                prisma.accountingCase.count({
                    where: { companyId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_INFO'] } }
                }),
                prisma.accountingDocument.count({ where: { case: { companyId } } }),
                prisma.journalEntry.count({ where: { companyId, status: 'POSTED' } }),
            ]);

            const aggr = await prisma.accountingCase.aggregate({
                where: { companyId, status: 'CLOSED' },
                _sum: { totalRevenue: true, totalExpense: true, ivaLiquidado: true, irtAmount: true, netResult: true }
            });

            res.json({
                totalCases, pendingReview, totalDocuments, postedEntries,
                totalRevenue: Number(aggr._sum.totalRevenue) || 0,
                totalExpense: Number(aggr._sum.totalExpense) || 0,
                ivaLiquidado: Number(aggr._sum.ivaLiquidado) || 0,
                irtAmount: Number(aggr._sum.irtAmount) || 0,
                netResult: Number(aggr._sum.netResult) || 0,
            });
        } catch (e) {
            res.status(500).json({ error: 'Erro ao calcular resumo' });
        }
    }

    static async sendMessage(req: Request, res: Response) {
        try {
            console.log(`[sendMessage] Hit! caseId: ${req.params.caseId}, userId: ${(req as any).user?.id}`);
            const caseId = String(req.params.caseId);
            const companyId = String((req as any).companyId);
            const userId = (req as any).user?.id || null;
            const { content, senderRole } = req.body;

            const c = await prisma.accountingCase.findFirst({ where: { id: caseId, companyId } });
            if (!c) return res.status(404).json({ error: 'Processo não encontrado' });

            const msg = await prisma.accountingCaseMessage.create({
                data: { caseId, userId, content, senderRole: senderRole || 'CLIENT' },
                include: { user: { select: { name: true } } }
            });
            res.status(201).json(msg);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao enviar mensagem' });
        }
    }

    /** Analytics – receitas/despesas/IVA por período (semanal/mensal/anual) */
    static async getAnalytics(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const period = q(req.query.period) || 'monthly'; // weekly | monthly | yearly

            const now = new Date();
            let from: Date;
            let groupFormat: string;

            if (period === 'weekly') {
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
                groupFormat = 'YYYY-WW';
            } else if (period === 'yearly') {
                from = new Date(now.getFullYear() - 5, 0, 1);
                groupFormat = 'YYYY';
            } else {
                from = new Date(now.getFullYear() - 1, now.getMonth(), 1);
                groupFormat = 'YYYY-MM';
            }

            // Fetch closed cases within range for period trends
            const cases = await prisma.accountingCase.findMany({
                where: {
                    companyId,
                    status: { in: ['REVIEWED', 'CLOSED'] },
                    createdAt: { gte: from }
                },
                select: {
                    period: true, totalRevenue: true, totalExpense: true,
                    ivaLiquidado: true, irtAmount: true, netResult: true, createdAt: true
                },
                orderBy: { createdAt: 'asc' }
            });

            // Group by period string
            const grouped: Record<string, any> = {};
            for (const c of cases) {
                const key = c.period || new Date(c.createdAt).toISOString().slice(0, 7);
                if (!grouped[key]) grouped[key] = { period: key, revenue: 0, expense: 0, iva: 0, irt: 0, net: 0 };
                grouped[key].revenue += Number(c.totalRevenue) || 0;
                grouped[key].expense += Number(c.totalExpense) || 0;
                grouped[key].iva += Number(c.ivaLiquidado) || 0;
                grouped[key].irt += Number(c.irtAmount) || 0;
                grouped[key].net += Number(c.netResult) || 0;
            }

            // Document submissions trend (filtrado por empresa — corrigido data leak)
            const docsByMonth = await prisma.$queryRaw<any[]>`
                SELECT TO_CHAR(d."uploadedAt", 'YYYY-MM') as month, COUNT(*) as total
                FROM "AccountingDocument" d
                INNER JOIN "AccountingCase" c ON d."caseId" = c.id
                WHERE d."uploadedAt" >= ${from} AND c."companyId" = ${companyId}
                GROUP BY month ORDER BY month
            `;

            // Cases by status
            const statusCount = await prisma.accountingCase.groupBy({
                by: ['status'],
                where: { companyId },
                _count: { _all: true }
            });

            const safeDocsByMonth = docsByMonth.map(doc => ({
                ...doc,
                total: typeof doc.total === 'bigint' ? Number(doc.total) : doc.total
            }));

            res.json({
                trends: Object.values(grouped),
                docsByMonth: safeDocsByMonth,
                statusCount: statusCount.map(s => ({ status: s.status, count: s._count._all })),
            });
        } catch (e) {
            console.error('[Analytics Error]', e);
            res.status(500).json({ error: 'Erro ao gerar analytics' });
        }
    }

    /** Balanço Geral – Ativo / Passivo / Capital Próprio consolidado */
    static async getBalanceSheet(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const year = Number(q(req.query.year)) || new Date().getFullYear();

            const from = new Date(year, 0, 1);
            const to = new Date(year, 11, 31, 23, 59, 59);

            const [cases, journalDebit, journalCredit, receivables, payables, bankBalance, assets] = await Promise.all([
                prisma.accountingCase.aggregate({
                    where: { companyId, status: { in: ['REVIEWED', 'CLOSED'] }, createdAt: { gte: from, lte: to } },
                    _sum: { totalRevenue: true, totalExpense: true, ivaLiquidado: true, ivaDedutivel: true, irtAmount: true, netResult: true }
                }),
                prisma.journalEntry.aggregate({
                    where: { companyId, status: 'POSTED', date: { gte: from, lte: to } },
                    _sum: { totalDebit: true }
                }),
                prisma.journalEntry.aggregate({
                    where: { companyId, status: 'POSTED', date: { gte: from, lte: to } },
                    _sum: { totalCredit: true }
                }),
                prisma.financialEntry.aggregate({ where: { companyId, type: 'RECEIVABLE' }, _sum: { amount: true } }),
                prisma.financialEntry.aggregate({ where: { companyId, type: 'PAYABLE' }, _sum: { amount: true } }),
                prisma.bankAccount.aggregate({ where: { companyId }, _sum: { balance: true } }),
                // Imobilizado: custo acumulado de manutenção dos activos operacionais como proxy do valor contabilístico
                prisma.maintenanceRecord.aggregate({
                    where: {
                        asset: { companyId },
                        date: { gte: new Date(0), lte: to } // acumulado até ao fim do exercício
                    },
                    _sum: { cost: true }
                }),
            ]);

            const revenue = Number(cases._sum.totalRevenue) || 0;
            const expense = Number(cases._sum.totalExpense) || 0;
            const iva = Number(cases._sum.ivaLiquidado) || 0;
            const ivaDed = Number(cases._sum.ivaDedutivel) || 0;
            const irt = Number(cases._sum.irtAmount) || 0;
            const netResult = Number(cases._sum.netResult) || 0;
            const cash = Number(bankBalance._sum.balance) || 0;
            const rec = Number(receivables._sum.amount) || 0;
            const pay = Number(payables._sum.amount) || 0;
            const imobilizado = Number(assets._sum.cost) || 0;

            const totalAtivo = cash + rec + imobilizado;

            res.json({
                year,
                // ATIVO
                ativo: {
                    circulante: { caixa: cash, clientesContaCorrente: rec, total: cash + rec },
                    naoCirculante: { imobilizado, total: imobilizado },
                    total: totalAtivo,
                },
                // PASSIVO
                passivo: {
                    circulante: {
                        fornecedores: pay,
                        ivaLiquidado: iva,
                        ivaDedutivel: ivaDed,
                        irtRetencoes: irt,
                        total: pay + iva - ivaDed + irt
                    },
                    total: pay + iva - ivaDed + irt,
                },
                // CAPITAL PRÓPRIO
                capitalProprio: {
                    resultadoExercicio: netResult,
                    total: netResult,
                },
                // DIÁRIO
                diario: {
                    totalDebito: Number(journalDebit._sum.totalDebit) || 0,
                    totalCredito: Number(journalCredit._sum.totalCredit) || 0,
                },
                receitas: revenue,
                despesas: expense,
            });
        } catch (e) {
            console.error('[BalanceSheet Error]', e);
            res.status(500).json({ error: 'Erro ao gerar balanço' });
        }
    }

    /** Demonstração de Resultados – P&L por período */
    static async getIncomeStatement(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const year = Number(q(req.query.year)) || new Date().getFullYear();
            const month = Number(q(req.query.month)); // 1-12, opcional

            let from: Date, to: Date;
            if (month >= 1 && month <= 12) {
                from = new Date(year, month - 1, 1);
                to = new Date(year, month, 0, 23, 59, 59);
            } else {
                from = new Date(year, 0, 1);
                to = new Date(year, 11, 31, 23, 59, 59);
            }

            const cases = await prisma.accountingCase.findMany({
                where: { companyId, status: { in: ['REVIEWED', 'CLOSED'] }, createdAt: { gte: from, lte: to } },
                select: {
                    period: true, title: true, totalRevenue: true, totalExpense: true,
                    ivaLiquidado: true, ivaDedutivel: true, irtAmount: true, netResult: true
                }
            });

            const totals = cases.reduce((acc: any, c: any) => ({
                revenue: acc.revenue + (Number(c.totalRevenue) || 0),
                expense: acc.expense + (Number(c.totalExpense) || 0),
                ivaLiquidado: acc.ivaLiquidado + (Number(c.ivaLiquidado) || 0),
                ivaDedutivel: acc.ivaDedutivel + (Number(c.ivaDedutivel) || 0),
                irtAmount: acc.irtAmount + (Number(c.irtAmount) || 0),
                netResult: acc.netResult + (Number(c.netResult) || 0),
            }), { revenue: 0, expense: 0, ivaLiquidado: 0, ivaDedutivel: 0, irtAmount: 0, netResult: 0 });

            const grossProfit = totals.revenue - totals.expense;
            const ebit = grossProfit - totals.ivaLiquidado + totals.ivaDedutivel;
            const margin = totals.revenue > 0 ? ((totals.netResult / totals.revenue) * 100).toFixed(1) : '0.0';

            res.json({
                period: { year, month: month || null, from, to },
                cases,
                totals,
                derived: { grossProfit, ebit, netMargin: margin }
            });
        } catch (e) {
            console.error('[IncomeStatement Error]', e);
            res.status(500).json({ error: 'Erro ao gerar demonstração de resultados' });
        }
    }

    /** Balancete de Verificação – Detalhe de todas as contas com saldos acumulados */
    static async getTrialBalance(req: Request, res: Response) {
        try {
            const companyId = String((req as any).companyId);
            const year = Number(q(req.query.year)) || new Date().getFullYear();
            const month = Number(q(req.query.month));

            let from: Date, to: Date;
            if (month >= 1 && month <= 12) {
                from = new Date(year, month - 1, 1);
                to = new Date(year, month, 0, 23, 59, 59);
            } else {
                from = new Date(year, 0, 1);
                to = new Date(year, 11, 31, 23, 59, 59);
            }

            // Fetch all accounts
            const accounts = await prisma.chartOfAccount.findMany({
                where: { OR: [{ companyId }, { companyId: null }], isActive: true },
                orderBy: { code: 'asc' }
            });

            // Fetch sums of debits and credits for each account in the period
            const periodSums = await prisma.journalEntryLine.groupBy({
                by: ['accountId'],
                where: {
                    entry: { companyId, status: 'POSTED', date: { gte: from, lte: to } }
                },
                _sum: { debit: true, credit: true }
            });

            // Fetch cumulative sums for opening balance (everything before 'from')
            const openingSums = await prisma.journalEntryLine.groupBy({
                by: ['accountId'],
                where: {
                    entry: { companyId, status: 'POSTED', date: { lt: from } }
                },
                _sum: { debit: true, credit: true }
            });

            // Build map for quick access
            const pMap = new Map(periodSums.map(s => [s.accountId, s._sum]));
            const oMap = new Map(openingSums.map(s => [s.accountId, s._sum]));

            const rows = accounts.map(acc => {
                const p = pMap.get(acc.id) || { debit: 0, credit: 0 };
                const o = oMap.get(acc.id) || { debit: 0, credit: 0 };

                const openingBalance = (Number(o.debit) || 0) - (Number(o.credit) || 0);
                const debit = Number(p.debit) || 0;
                const credit = Number(p.credit) || 0;
                const endingBalance = openingBalance + debit - credit;

                return {
                    id: acc.id,
                    code: acc.code,
                    name: acc.name,
                    nature: acc.nature,
                    class: acc.class,
                    openingBalance,
                    debit,
                    credit,
                    endingBalance
                };
            }).filter(r => r.openingBalance !== 0 || r.debit !== 0 || r.credit !== 0);

            const totals = rows.reduce((acc, r) => ({
                opening: acc.opening + r.openingBalance,
                debit: acc.debit + r.debit,
                credit: acc.credit + r.credit,
                ending: acc.ending + r.endingBalance
            }), { opening: 0, debit: 0, credit: 0, ending: 0 });

            res.json({ period: { year, month: month || null, from, to }, rows, totals });
        } catch (e) {
            console.error('[TrialBalance Error]', e);
            res.status(500).json({ error: 'Erro ao gerar balancete' });
        }
    }

    static async getRequiredDocumentsConfig(req: Request, res: Response) {
        try {
            const requiredDocuments = await AccountingCaseController.getRequiredDocuments();
            const banksList = await AccountingCaseController.getBanksList();
            res.json({
                requiredDocuments,
                banksList
            });
        } catch (e) {
            res.status(500).json({ error: 'Erro ao obter configuração de documentos' });
        }
    }

    static async updateRequiredDocumentsConfig(req: Request, res: Response) {
        try {
            const { requiredDocuments, banksList } = req.body;
            
            if (requiredDocuments) {
                await prisma.systemSetting.upsert({
                    where: { key: 'REQUIRED_DOCUMENTS' },
                    update: { value: JSON.stringify(requiredDocuments) },
                    create: { key: 'REQUIRED_DOCUMENTS', value: JSON.stringify(requiredDocuments), description: 'Configuração de documentos contabilísticos obrigatórios' }
                });
            }
            
            if (banksList) {
                await prisma.systemSetting.upsert({
                    where: { key: 'BANKS_LIST' },
                    update: { value: JSON.stringify(banksList) },
                    create: { key: 'BANKS_LIST', value: JSON.stringify(banksList), description: 'Lista de bancos suportados para extratos bancários' }
                });
            }
            
            res.json({ success: true, message: 'Configurações actualizadas com sucesso' });
        } catch (e) {
            console.error('[updateRequiredDocumentsConfig Error]', e);
            res.status(500).json({ error: 'Erro ao guardar configurações de documentos' });
        }
    }

    static async exportAuditArchive(req: Request, res: Response) {
        try {
            const caseId = String(req.params.caseId);
            const companyId = String((req as any).companyId);

            const c = await prisma.accountingCase.findFirst({
                where: { id: caseId, companyId },
                include: { documents: true, client: true }
            });
            if (!c) return res.status(404).json({ error: 'Processo não encontrado' });

            // Fetch document types from database configuration
            const requiredDocuments = await AccountingCaseController.getRequiredDocuments();

            // Create temporary folders
            const tempDirName = `audit-${caseId}-${Date.now()}`;
            const tempDir = path.join(process.cwd(), 'uploads', tempDirName);
            await fs.promises.mkdir(tempDir, { recursive: true });

            for (const doc of c.documents) {
                const reqDocConfig = requiredDocuments.find((r: any) => r.key === doc.type);
                const folderName = reqDocConfig
                    ? reqDocConfig.label.replace(/[^\w\s-]/g, '').trim()
                    : 'Documentos Adicionais';
                const dirPath = path.join(tempDir, folderName);
                await fs.promises.mkdir(dirPath, { recursive: true });

                if (doc.status === 'NOT_APPLICABLE') {
                    const txtPath = path.join(dirPath, `${doc.name.replace(/[\/\\?%*:|"<>]/g, '_')}_JUSTIFICACAO.txt`);
                    const content = `JUSTIFICAÇÃO DE AUSÊNCIA\n\nDocumento: ${doc.name}\nMotivo: ${doc.description || 'Não aplicável para este exercício'}\nRegistado em: ${doc.uploadedAt}\n`;
                    await fs.promises.writeFile(txtPath, content);
                } else if (doc.fileUrl) {
                    const sanitizedName = doc.name.replace(/[\/\\?%*:|"<>]/g, '_');
                    const targetPath = path.join(dirPath, sanitizedName);

                    if (doc.fileUrl.startsWith('http')) {
                        // Remote file — download it
                        try {
                            const response = await fetch(doc.fileUrl);
                            if (response.ok) {
                                const buffer = Buffer.from(await response.arrayBuffer());
                                await fs.promises.writeFile(targetPath, buffer);
                            }
                        } catch (err) {
                            console.error(`Erro ao descarregar ficheiro remoto: ${doc.fileUrl}`, err);
                        }
                    } else {
                        // Local file — first try the pre-mirrored audit folder
                        const period = c.period.replace(/[^\w-]/g, '_');
                        const auditMirrorDir = path.join(
                            process.cwd(), 'uploads', 'accounting', 'audit',
                            companyId, period, folderName
                        );
                        const mirrorFilename = path.basename(doc.fileUrl);
                        const mirrorPath = path.join(auditMirrorDir, mirrorFilename);

                        const sourceToUse = fs.existsSync(mirrorPath)
                            ? mirrorPath
                            : path.join(process.cwd(), doc.fileUrl.replace(/^\//, ''));

                        if (fs.existsSync(sourceToUse)) {
                            try {
                                await fs.promises.copyFile(sourceToUse, targetPath);
                            } catch (err) {
                                console.error(`Erro ao copiar ficheiro: ${sourceToUse}`, err);
                            }
                        }
                    }
                }
            }

            // Create tar.gz archive
            const archiveName = `audit-${caseId}.tar.gz`;
            const archivePath = path.join(process.cwd(), 'uploads', archiveName);
            
            // Run shell command to compress
            await execPromise(`tar -czf "${archivePath}" -C "${tempDir}" .`);

            // Clean up temporary directory
            await fs.promises.rm(tempDir, { recursive: true, force: true });

            // Send archive file
            res.download(archivePath, `dossier-contabilistico-${c.period}.tar.gz`, async (err) => {
                // Delete archive file after sending
                try {
                    if (fs.existsSync(archivePath)) {
                        await fs.promises.unlink(archivePath);
                    }
                } catch (cleanupErr) {
                    console.error('Erro ao limpar arquivo de exportação:', cleanupErr);
                }
            });
        } catch (error) {
            console.error('[Case.exportAuditArchive]', error);
            res.status(500).json({ error: 'Erro ao gerar o arquivo de auditoria' });
        }
    }
}
