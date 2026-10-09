import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LocalFileStorage } from './local.file-storage.js';

const BUCKET = 'accountable-documents';
const SECRET = 'test-storage-signing-secret-with-32-chars';

async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks).toString();
}

function queryOf(url: string) {
  return Object.fromEntries(new URL(url, 'http://x').searchParams) as { b: string; k: string; e: string; s: string };
}

describe('LocalFileStorage', () => {
  let root: string;
  let storage: LocalFileStorage;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'va-storage-'));
    storage = new LocalFileStorage({ rootDir: root, signingSecret: SECRET });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  const upload = (objectName = 'documents/doc-1/abc.pdf', content = '%PDF-1.7 teste') =>
    storage.upload({
      bucketName: BUCKET,
      objectName,
      buffer: Buffer.from(content),
      size: content.length,
      mimeType: 'application/pdf',
      metadata: { originalName: encodeURIComponent('Fatura Março nº 1.pdf') },
    });

  it('guarda o ficheiro no disco, dentro da raiz, e permite ler/verificar/apagar', async () => {
    await storage.ensureBucketExists(BUCKET);
    const result = await upload();

    expect(result.storagePath).toBe(`${BUCKET}/documents/doc-1/abc.pdf`);
    expect(await storage.exists(BUCKET, 'documents/doc-1/abc.pdf')).toBe(true);
    expect((await storage.getObject(BUCKET, 'documents/doc-1/abc.pdf')).toString()).toBe('%PDF-1.7 teste');
    // Sem ficheiros temporários esquecidos (escrita atómica).
    expect((await readdir(path.join(root, BUCKET, 'documents/doc-1'))).sort()).toEqual(['abc.pdf', 'abc.pdf.meta.json']);

    await storage.delete(BUCKET, 'documents/doc-1/abc.pdf');
    expect(await storage.exists(BUCKET, 'documents/doc-1/abc.pdf')).toBe(false);
    expect(await readdir(path.join(root, BUCKET, 'documents/doc-1'))).toEqual([]);
  });

  it.each(['../../etc/passwd', 'documents/../../fora.txt', '/etc/passwd', 'a\0b'])(
    'rejeita caminhos perigosos (%s)',
    async (objectName) => {
      await expect(storage.upload({ bucketName: BUCKET, objectName, buffer: Buffer.from('x'), size: 1, mimeType: 'text/plain' })).rejects.toThrow();
      await expect(storage.getObject(BUCKET, objectName)).rejects.toThrow();
    },
  );

  it('rejeita nomes de bucket inválidos', async () => {
    await expect(storage.ensureBucketExists('../x')).rejects.toThrow(/bucket inválido/);
  });

  it('URL assinado relativo: devolve o ficheiro com tipo e nome original', async () => {
    await upload();
    const url = await storage.getSignedUrl({ bucketName: BUCKET, objectName: 'documents/doc-1/abc.pdf', expiresIn: 900 });

    expect(url.startsWith('/api/v1/files/download?')).toBe(true);
    const file = await storage.openSignedDownload(queryOf(url));
    expect(file).not.toBeNull();
    expect(file!.mimeType).toBe('application/pdf');
    expect(file!.fileName).toBe('Fatura Março nº 1.pdf');
    expect(await readStream(file!.stream)).toBe('%PDF-1.7 teste');
  });

  it('URL adulterado, expirado ou assinado com outra chave é recusado', async () => {
    await upload();
    await upload('documents/doc-2/outro.pdf', '%PDF-1.7 outro');
    const q = queryOf(await storage.getSignedUrl({ bucketName: BUCKET, objectName: 'documents/doc-1/abc.pdf', expiresIn: 900 }));

    // Trocar o objeto mantendo a assinatura (tentativa de aceder a outro documento).
    expect(await storage.openSignedDownload({ ...q, k: 'documents/doc-2/outro.pdf' })).toBeNull();
    // Estender a validade.
    expect(await storage.openSignedDownload({ ...q, e: String(Number(q.e) + 3600) })).toBeNull();
    // Expirado.
    const expired = queryOf(await storage.getSignedUrl({ bucketName: BUCKET, objectName: 'documents/doc-1/abc.pdf', expiresIn: -1 }));
    expect(await storage.openSignedDownload(expired)).toBeNull();
    // Outra chave.
    const other = new LocalFileStorage({ rootDir: root, signingSecret: 'outra-chave-de-assinatura-com-32-chars!' });
    expect(await other.openSignedDownload(q)).toBeNull();
    // Parâmetros em falta.
    expect(await storage.openSignedDownload({})).toBeNull();
  });
});
