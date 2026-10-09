import { describe, it, expect, beforeAll } from 'vitest';
import { SigningService } from '../services/SigningService';

// ─── Suite 1: Assinatura Digital AGT ──────────────────────────────────────────
describe('SigningService (AGT Compliance — Anexo I)', () => {

    beforeAll(() => {
        // Garantir ambiente de teste sem chave privada real (usa fallback)
        delete process.env.AGT_PRIVATE_KEY_PEM;
    });

    it('should generate a 172-character base64 hash (development fallback)', () => {
        const input = {
            invoiceDate: new Date('2026-05-08'),
            systemEntryDate: new Date('2026-05-08T12:00:00'),
            invoiceNo: 'FT 2026/0001',
            grossTotal: 1500.50,
            previousHash: null
        };
        const hash = SigningService.generateDocumentHash(input);
        expect(hash).toBeDefined();
        expect(hash.length).toBe(172);
        expect(/^[A-Za-z0-9+/=]+$/.test(hash)).toBe(true);
    });

    it('should produce different hashes for different invoice numbers (non-collision)', () => {
        const base = {
            invoiceDate: new Date('2026-05-08'),
            systemEntryDate: new Date('2026-05-08T12:00:00'),
            grossTotal: 1000.00,
            previousHash: null
        };
        const h1 = SigningService.generateDocumentHash({ ...base, invoiceNo: 'FT 2026/0001' });
        const h2 = SigningService.generateDocumentHash({ ...base, invoiceNo: 'FT 2026/0002' });
        expect(h1).not.toBe(h2);
    });

    it('should produce deterministic hashes for the same input', () => {
        const input = {
            invoiceDate: new Date('2026-01-15'),
            systemEntryDate: new Date('2026-01-15T09:30:00'),
            invoiceNo: 'FR 2026/0010',
            grossTotal: 25000.00,
            previousHash: 'abc123'
        };
        const h1 = SigningService.generateDocumentHash(input);
        const h2 = SigningService.generateDocumentHash(input);
        expect(h1).toBe(h2);
    });

    it('should chain hashes correctly (previousHash affects output)', () => {
        const base = {
            invoiceDate: new Date('2026-05-08'),
            systemEntryDate: new Date('2026-05-08T10:00:00'),
            invoiceNo: 'FT 2026/0005',
            grossTotal: 500.00,
        };
        const hFirst  = SigningService.generateDocumentHash({ ...base, previousHash: null });
        const hSecond = SigningService.generateDocumentHash({ ...base, previousHash: hFirst });
        expect(hFirst).not.toBe(hSecond);
    });

    // ── Ponto 6b do Anexo I: caracteres de impressão ──────────────────────────
    it('should extract the correct print characters — 1st, 11th, 21st, 31st (Ponto 6b)', () => {
        const mockHash = 'A123456789B123456789C123456789D123456789'; // 40 chars
        expect(SigningService.getHashPrintChars(mockHash)).toBe('ABCD');
    });

    it('should return "????" for a short/invalid hash', () => {
        expect(SigningService.getHashPrintChars('short')).toBe('????');
        expect(SigningService.getHashPrintChars('')).toBe('????');
    });

    // ── Ponto 7 do Anexo I: HashControl ───────────────────────────────────────
    it('should return a valid HashControl string (certNumber.keyVersion)', () => {
        const control = SigningService.getHashControl();
        expect(control).toMatch(/^\d+\/AGT\/\d+\.\d+$/);
    });

    it('should return the correct certificate number (232/AGT/2026)', () => {
        expect(SigningService.getCertificateNumber()).toBe('232/AGT/2026');
    });

    // ── Validation string ───────────────────────────────────────────────────
    it('should generate a complete document validation string for printing', () => {
        const mockHash = 'A123456789B123456789C123456789D123456789XXXXXXX';
        const validStr = SigningService.getDocumentValidationString(mockHash);
        expect(validStr).toContain('ABCD');
        expect(validStr).toContain('232/AGT/2026');
    });

    it('should generate a receipt validation string without hash chars', () => {
        const rcptStr = SigningService.getReceiptValidationString();
        expect(rcptStr).toContain('232/AGT/2026');
        expect(rcptStr).toContain('Emitido por programa validado');
    });

    // ── Invoice hash alias ──────────────────────────────────────────────────
    it('should generate a valid hash using generateInvoiceHash convenience method', () => {
        const hash = SigningService.generateInvoiceHash({
            issueDate: new Date('2026-03-20'),
            number: 'FT 2026/0099',
            totalAmount: 75000.00,
        }, null);
        expect(hash.length).toBe(172);
    });
});
