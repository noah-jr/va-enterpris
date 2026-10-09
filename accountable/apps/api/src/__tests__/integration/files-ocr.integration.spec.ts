import { describe, it, expect } from 'vitest';
import { loginAsAdmin, loginAsSeededClient } from './helpers/auth.js';

interface DocumentFileDTO {
  id: string;
  documentId: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
}

interface UploadFileResponse {
  data: DocumentFileDTO;
}

interface DocumentOcrResult {
  documentId: string;
  fileId: string;
  extractedText: string;
  characterCount: number;
  wordCount: number;
  detectedDocumentType: string;
  confidenceScore: number;
}

interface OcrResponse {
  data: DocumentOcrResult;
}

describe('Upload de ficheiros e análise OCR — contra MinIO real', () => {
  it('cliente faz upload de um ficheiro .txt para um documento e consegue correr a análise OCR sobre ele', async () => {
    const { client } = await loginAsSeededClient();

    const createDocRes = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento com anexo para OCR',
      type: 'CONTRATO',
    });
    expect(createDocRes.status).toBe(201);
    const documentId = createDocRes.body.data.id;

    const fileContent = 'Contrato de prestação de serviços. NIF do cliente: 500123456. Valor: 1500,00 EUR.';

    const uploadRes = await client.uploadFile<UploadFileResponse>(
      `/api/v1/documents/${documentId}/files`,
      {
        filename: 'contrato-teste.txt',
        mimeType: 'text/plain',
        content: fileContent,
      },
    );
    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.data.documentId).toBe(documentId);
    expect(uploadRes.body.data.originalName).toBe('contrato-teste.txt');
    expect(uploadRes.body.data.size).toBe(Buffer.byteLength(fileContent));
    expect(uploadRes.body.data.checksum).toBeTruthy();

    const getDocRes = await client.get<{ data: { files: DocumentFileDTO[] } }>(
      `/api/v1/documents/${documentId}`,
    );
    expect(getDocRes.status).toBe(200);
    expect(getDocRes.body.data.files.length).toBeGreaterThanOrEqual(1);
    expect(getDocRes.body.data.files.some((f) => f.id === uploadRes.body.data.id)).toBe(true);

    // OCR/apoio à decisão é ferramenta interna: cliente recebe 403, consultor/admin 200.
    const clientOcr = await client.get(`/api/v1/documents/${documentId}/ocr`);
    expect(clientOcr.status).toBe(403);

    const { client: admin } = await loginAsAdmin();
    const ocrRes = await admin.get<OcrResponse>(`/api/v1/documents/${documentId}/ocr`);
    expect(ocrRes.status).toBe(200);
    expect(ocrRes.body.data.documentId).toBe(documentId);
    expect(ocrRes.body.data.fileId).toBeTruthy();
    expect(ocrRes.body.data.extractedText).toContain('500123456');
    expect(ocrRes.body.data.characterCount).toBeGreaterThan(0);
    expect(ocrRes.body.data.wordCount).toBeGreaterThan(0);
  });

  it('rejeita upload de um tipo de ficheiro não permitido pela allowlist', async () => {
    const { client } = await loginAsSeededClient();

    const createDocRes = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento para teste de MIME inválido',
      type: 'CONTRATO',
    });
    const documentId = createDocRes.body.data.id;

    const uploadRes = await client.uploadFile(`/api/v1/documents/${documentId}/files`, {
      filename: 'script-malicioso.exe',
      mimeType: 'application/x-msdownload',
      content: 'conteúdo qualquer',
    });
    expect(uploadRes.status).toBe(400);
  });

  it('rejeita executável disfarçado de PDF (validação por magic bytes)', async () => {
    const { client } = await loginAsSeededClient();
    const doc = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento para teste de conteúdo falsificado',
      type: 'CONTRATO',
    });

    const res = await client.uploadFile<{ message: string }>(`/api/v1/documents/${doc.body.data.id}/files`, {
      filename: 'fatura.pdf',
      mimeType: 'application/pdf',
      content: Buffer.concat([Buffer.from('MZ'), Buffer.alloc(64)]),
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/não corresponde ao tipo declarado/);
  });

  it('aceita um PDF real (assinatura %PDF-)', async () => {
    const { client } = await loginAsSeededClient();
    const doc = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento com PDF',
      type: 'CONTRATO',
    });
    const res = await client.uploadFile(`/api/v1/documents/${doc.body.data.id}/files`, {
      filename: 'fatura.pdf',
      mimeType: 'application/pdf',
      content: Buffer.from('%PDF-1.7\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF'),
    });
    expect(res.status).toBe(201);
  });

  it('rejeita análise OCR de um documento sem ficheiros anexados', async () => {
    const { client } = await loginAsSeededClient();

    const createDocRes = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento sem anexos',
      type: 'OUTRO',
    });
    const documentId = createDocRes.body.data.id;

    const { client: admin } = await loginAsAdmin();
    const ocrRes = await admin.get(`/api/v1/documents/${documentId}/ocr`);
    expect(ocrRes.status).toBe(404);
  });
});
