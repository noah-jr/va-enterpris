import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loginAsAdmin, loginAsSeededClient } from './helpers/auth.js';
import { BASE_URL } from './helpers/constants.js';
import { db } from './helpers/db.js';

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const STORAGE_ROOT = path.join(API_ROOT, 'storage');
const PDF = Buffer.from('%PDF-1.7\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n');

interface DocumentDetails {
  data: { files: Array<{ id: string; originalName: string; downloadUrl: string }> };
}

async function uploadPdf(originalName = 'Balancete Março.pdf') {
  const { client } = await loginAsSeededClient();
  const doc = await client.post<{ data: { id: string } }>('/api/v1/documents', { title: 'Armazenamento local', type: 'CONTRATO' });
  const upload = await client.uploadFile<{ data: { id: string } }>(`/api/v1/documents/${doc.body.data.id}/files`, {
    filename: originalName,
    mimeType: 'application/pdf',
    content: PDF,
  });
  expect(upload.status).toBe(201);
  return { client, documentId: doc.body.data.id, fileId: upload.body.data.id };
}

describe('Armazenamento local de documentos (STORAGE_DRIVER=local)', () => {
  it('o ficheiro é gravado em disco dentro de apps/api/storage (não no MinIO)', async () => {
    const { fileId } = await uploadPdf();
    const row = await db.documentFile.findUniqueOrThrow({ where: { id: fileId } });

    const onDisk = path.join(STORAGE_ROOT, row.storagePath);
    expect(onDisk.startsWith(STORAGE_ROOT + path.sep)).toBe(true);
    expect(existsSync(onDisk)).toBe(true);
    expect(readFileSync(onDisk).equals(PDF)).toBe(true);
  });

  it('download pelo link assinado devolve o ficheiro com tipo e nome original (cliente e admin)', async () => {
    const { client, documentId } = await uploadPdf('Balancete Março.pdf');
    const details = await client.get<DocumentDetails>(`/api/v1/documents/${documentId}`);
    const file = details.body.data.files[0]!;

    expect(file.downloadUrl.startsWith('/api/v1/files/download?')).toBe(true);

    const res = await fetch(`${BASE_URL}${file.downloadUrl}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    expect(res.headers.get('content-disposition')).toContain(`filename*=UTF-8''${encodeURIComponent('Balancete Março.pdf')}`);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(Buffer.from(await res.arrayBuffer()).equals(PDF)).toBe(true);

    const { client: admin } = await loginAsAdmin();
    const adminView = await admin.get<DocumentDetails>(`/api/v1/documents/${documentId}`);
    expect((await fetch(`${BASE_URL}${adminView.body.data.files[0]!.downloadUrl}`)).status).toBe(200);
  });

  it('link adulterado, com outro ficheiro ou com validade estendida → 404', async () => {
    const a = await uploadPdf();
    const b = await uploadPdf();
    const urlA = new URL((await a.client.get<DocumentDetails>(`/api/v1/documents/${a.documentId}`)).body.data.files[0]!.downloadUrl, BASE_URL);
    const rowB = await db.documentFile.findUniqueOrThrow({ where: { id: b.fileId } });

    const otherFile = new URL(urlA);
    otherFile.searchParams.set('k', rowB.storagePath.split('/').slice(1).join('/'));
    expect((await fetch(otherFile)).status).toBe(404);

    const extended = new URL(urlA);
    extended.searchParams.set('e', String(Number(urlA.searchParams.get('e')) + 86_400));
    expect((await fetch(extended)).status).toBe(404);

    const traversal = new URL(urlA);
    traversal.searchParams.set('k', '../../../../etc/passwd');
    expect((await fetch(traversal)).status).toBe(404);

    expect((await fetch(`${BASE_URL}/api/v1/files/download`)).status).toBe(404);
  });

  it('OCR lê o ficheiro a partir do disco local', async () => {
    const { documentId } = await uploadPdf();
    const { client: admin } = await loginAsAdmin();
    const ocr = await admin.get<{ data: { documentId: string } }>(`/api/v1/documents/${documentId}/ocr`);
    expect(ocr.status).toBe(200);
    expect(ocr.body.data.documentId).toBe(documentId);
  });
});
