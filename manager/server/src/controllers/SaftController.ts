import { Request, Response } from 'express';
import { SaftService } from '../services/SaftService';
import { SigningService } from '../services/SigningService';

export class SaftController {
    /**
     * Exporta o ficheiro XML SAF-T(AO) conforme requisitos do Decreto Executivo.
     *
     * Query params:
     * - year: Ano fiscal (default: ano corrente)
     * - month: Mês opcional (1-12) para exportação mensal
     */
    static async exportSaft(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) {
                return res.status(400).json({ error: 'Company ID é obrigatório' });
            }

            const year = parseInt(req.query.year as string) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month as string) : undefined;

            if (month && (month < 1 || month > 12)) {
                return res.status(400).json({ error: 'Mês inválido. Deve ser entre 1 e 12.' });
            }

            const xml = await SaftService.generateSaft(companyId, year, month);

            // Nome do ficheiro conforme convenção AGT
            const monthSuffix = month ? `_M${String(month).padStart(2, '0')}` : '';
            const filename = `SAFT_AO_${companyId}_${year}${monthSuffix}.xml`;

            res.header('Content-Type', 'application/xml; charset=utf-8');
            res.header('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(xml);
        } catch (error: any) {
            console.error('[SaftController] Erro ao exportar SAF-T:', error);
            res.status(500).json({ error: error.message || 'Falha ao exportar SAF-T' });
        }
    }

    /**
     * Retorna o resumo fiscal para o dashboard do módulo fiscal.
     *
     * Query params:
     * - year: Ano fiscal (default: ano corrente)
     * - month: Mês opcional (1-12) para resumo mensal
     */
    static async getFiscalSummary(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) {
                return res.status(400).json({ error: 'Company ID é obrigatório' });
            }

            const year = parseInt(req.query.year as string) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month as string) : undefined;

            const summary = await SaftService.getFiscalSummary(companyId, year, month);
            res.json(summary);
        } catch (error: any) {
            console.error('[SaftController] Erro ao obter resumo fiscal:', error);
            res.status(500).json({ error: error.message || 'Falha ao obter resumo fiscal' });
        }
    }

    /**
     * Valida a assinatura de um documento.
     * Permite verificar externamente se um hash é auténtico.
     *
     * Body: { invoiceDate, systemEntryDate, invoiceNo, grossTotal, hash }
     */
    static async validateHash(req: Request, res: Response) {
        try {
            const { invoiceDate, systemEntryDate, invoiceNo, grossTotal, previousHash } = req.body;

            if (!invoiceDate || !systemEntryDate || !invoiceNo || grossTotal === undefined) {
                return res.status(400).json({ error: 'Parâmetros obrigatórios em falta' });
            }

            const computedHash = SigningService.generateDocumentHash({
                invoiceDate: new Date(invoiceDate),
                systemEntryDate: new Date(systemEntryDate),
                invoiceNo,
                grossTotal: parseFloat(grossTotal),
                previousHash: previousHash || null
            });

            const printChars = SigningService.getHashPrintChars(computedHash);
            const validationString = SigningService.getDocumentValidationString(computedHash);

            res.json({
                hash: computedHash,
                printChars,
                validationString,
                hashControl: SigningService.getHashControl(),
                certificateNumber: SigningService.getCertificateNumber(),
                keyVersion: SigningService.getKeyVersion(),
                messageFormat: `${invoiceDate};${systemEntryDate};${invoiceNo};${parseFloat(grossTotal).toFixed(2)};${previousHash || ''}`
            });
        } catch (error: any) {
            console.error('[SaftController] Erro ao validar hash:', error);
            res.status(500).json({ error: error.message || 'Falha na validação do hash' });
        }
    }
}
