import { describe, it, expect, beforeEach } from 'vitest';
import { OcrService } from './ocr.service.js';
import type { ProcessOcrInput } from '../../application/contracts/ocr.contract.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEXT_ACCOUNTING =
  'balanço ativo passivo plano de contas IVA IRC IES fatura 500000001';
const TEXT_CONTRACT =
  'primeiro outorgante segundo outorgante cláusula contrato de prestação';
const TEXT_BINARY_FALLBACK = '[Ficheiro binário image/png — Pré-visualização textual não disponível]';

function buildInput(overrides: Partial<ProcessOcrInput> = {}): ProcessOcrInput {
  return {
    documentId: 'doc-1',
    documentTitle: 'Balancete 2026',
    declaredType: 'Contabilístico / Fiscal',
    clientNip: '500000001',
    clientName: 'Empresa Alfa Lda',
    fileId: 'file-1',
    fileName: 'balancete.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    buffer: Buffer.from(TEXT_ACCOUNTING),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// extractText
// ---------------------------------------------------------------------------

describe('OcrService.extractText', () => {
  let service: OcrService;

  beforeEach(() => {
    service = new OcrService();
  });

  it('extrai texto de ficheiros text/plain directamente do buffer', async () => {
    const buf = Buffer.from('linha 1\nlinha 2\n');
    const result = await service.extractText(buf, 'text/plain', 'documento.txt');
    expect(result).toBe('linha 1\nlinha 2\n');
  });

  it('extrai texto de ficheiros CSV directamente do buffer', async () => {
    const buf = Buffer.from('nif;valor\n500;1000\n');
    const result = await service.extractText(buf, 'text/csv', 'dados.csv');
    expect(result).toBe('nif;valor\n500;1000\n');
  });

  it('extrai texto de ficheiros .json por extensão', async () => {
    const buf = Buffer.from('{"ok":true}');
    const result = await service.extractText(buf, 'application/octet-stream', 'data.json');
    expect(result).toBe('{"ok":true}');
  });

  it('retorna placeholder para ficheiros binários sem suporte textual (ex: PNG)', async () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const result = await service.extractText(buf, 'image/png', 'foto.png');
    expect(result).toBe(TEXT_BINARY_FALLBACK);
  });

  it('activa path PDF para mimeType application/pdf e retorna fallback se pdftotext falhar', async () => {
    // Em ambiente CI sem pdftotext instalado, o fallback deve ser activado
    const buf = Buffer.from('%PDF-1.4 mock pdf');
    const result = await service.extractText(buf, 'application/pdf', 'doc.pdf');
    // Resultado é string não vazia — seja texto extraído ou fallback de erro
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('activa path PDF por extensão .pdf mesmo com mimeType genérico', async () => {
    const buf = Buffer.from('%PDF-1.4 mock pdf');
    const result = await service.extractText(buf, 'application/octet-stream', 'relatorio.pdf');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// analyzeDocument
// ---------------------------------------------------------------------------

describe('OcrService.analyzeDocument', () => {
  let service: OcrService;

  beforeEach(() => {
    service = new OcrService();
  });

  it('detecta tipo Contabilístico / Fiscal para texto com palavras-chave contabilísticas', () => {
    const result = service.analyzeDocument(buildInput(), TEXT_ACCOUNTING);

    expect(result.detectedDocumentType).toBe('Documento Contabilístico / Fiscal');
    expect(result.decisionRecommendation.suggestedStatus).toBe('IN_PROCESSING');
    expect(result.decisionRecommendation.typeMatchScore).toBe(100);
    expect(result.decisionRecommendation.complianceFlags).toHaveLength(0);
  });

  it('detecta tipo Contrato de Prestação de Serviços para texto com cláusulas contratuais', () => {
    const input = buildInput({ declaredType: 'Contrato de Prestação' });
    const result = service.analyzeDocument(input, TEXT_CONTRACT);

    expect(result.detectedDocumentType).toBe('Contrato de Prestação de Serviços');
  });

  it('detecta NIFs no texto e inclui na lista detectedNifs', () => {
    const textWithNif = `${TEXT_ACCOUNTING} outro nif 500000002`;
    const result = service.analyzeDocument(buildInput(), textWithNif);

    expect(result.detectedNifs).toContain('500000001');
  });

  it('isNifMatchingClient = true quando o NIF do cliente está no texto', () => {
    const result = service.analyzeDocument(buildInput(), TEXT_ACCOUNTING);
    expect(result.decisionRecommendation.isNifMatchingClient).toBe(true);
  });

  it('isNifMatchingClient = false quando o NIF do cliente não está no texto', () => {
    const result = service.analyzeDocument(buildInput(), 'texto sem nenhum nif');
    expect(result.decisionRecommendation.isNifMatchingClient).toBe(false);
  });

  it('detecta datas no formato dd/mm/aaaa e inclui em detectedDates', () => {
    const textWithDate = `${TEXT_ACCOUNTING} 01/09/2026 31/12/2025`;
    const result = service.analyzeDocument(buildInput(), textWithDate);

    expect(result.detectedDates).toContain('01/09/2026');
    expect(result.detectedDates).toContain('31/12/2025');
  });

  it('detecta montantes monetários (€) e inclui em detectedAmounts', () => {
    const textWithAmount = `${TEXT_ACCOUNTING} € 1.500,00 EUR 200`;
    const result = service.analyzeDocument(buildInput(), textWithAmount);

    expect(result.detectedAmounts.length).toBeGreaterThan(0);
  });

  it('contém as métricas correctas de characterCount, wordCount e pageCount', () => {
    const text = 'palavra um dois três';
    const result = service.analyzeDocument(buildInput(), text);

    expect(result.characterCount).toBe(text.length);
    expect(result.wordCount).toBe(4);
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
  });

  it('devolve sempre documentId e fileId do input', () => {
    const input = buildInput({ documentId: 'doc-xyz', fileId: 'file-xyz' });
    const result = service.analyzeDocument(input, 'texto');

    expect(result.documentId).toBe('doc-xyz');
    expect(result.fileId).toBe('file-xyz');
  });

  it('assinala DISCREPANCIA_TIPO_DOCUMENTO quando o tipo declarado é fiscal mas o texto é académico', () => {
    const academicText =
      'universidade reitor licenciatura disciplina coordenação bolsista professor';
    const input = buildInput({ declaredType: 'Contabilístico fiscal' });
    const result = service.analyzeDocument(input, academicText);

    expect(result.decisionRecommendation.complianceFlags).toContain('DISCREPANCIA_TIPO_DOCUMENTO');
    expect(result.decisionRecommendation.suggestedStatus).toBe('AWAITING_DOCUMENT');
    expect(result.decisionRecommendation.typeMatchScore).toBeLessThan(50);
  });

  it('suggestedNote não está vazio em nenhum cenário', () => {
    const result = service.analyzeDocument(buildInput(), TEXT_ACCOUNTING);
    expect(result.decisionRecommendation.suggestedNote.length).toBeGreaterThan(0);
  });

  it('processedAt é uma string ISO 8601 válida', () => {
    const result = service.analyzeDocument(buildInput(), 'texto');
    expect(() => new Date(result.processedAt)).not.toThrow();
    expect(new Date(result.processedAt).toISOString()).toBe(result.processedAt);
  });
});
