import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, type ReadStream } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  GetSignedUrlParams,
  IFileStorage,
  UploadFileParams,
  UploadFileResult,
} from '../../application/contracts/index.js';

interface StoredMetadata {
  mimeType: string;
  size: number;
  metadata: Record<string, string>;
  createdAt: string;
}

export interface LocalFileStorageConfig {
  /** Diretório raiz onde os ficheiros são guardados. */
  rootDir: string;
  /** Segredo HMAC para assinar os URLs de download temporários. */
  signingSecret: string;
  /** Caminho público da rota de download (relativo — funciona atrás do proxy do Vite e em produção). */
  downloadPath?: string;
}

export interface VerifiedDownload {
  stream: ReadStream;
  mimeType: string;
  size: number;
  /** Nome original do ficheiro (para Content-Disposition). */
  fileName: string;
}

const BUCKET_RE = /^[a-z0-9][a-z0-9.-]{1,62}$/;
const META_SUFFIX = '.meta.json';

/**
 * Armazenamento de documentos em disco local (alternativa ao MinIO).
 * - Caminhos validados contra path traversal (nada sai de `rootDir`).
 * - Escrita atómica (ficheiro temporário + rename).
 * - Downloads por URL assinado com HMAC e expiração, servido pela própria API.
 */
export class LocalFileStorage implements IFileStorage {
  private readonly root: string;
  private readonly downloadPath: string;

  constructor(private readonly config: LocalFileStorageConfig) {
    this.root = path.resolve(config.rootDir);
    this.downloadPath = config.downloadPath ?? '/api/v1/files/download';
  }

  /** Resolve bucket/objeto para um caminho absoluto dentro da raiz — ou lança. */
  private resolvePath(bucketName: string, objectName: string): string {
    if (!BUCKET_RE.test(bucketName)) throw new Error(`Nome de bucket inválido: ${bucketName}`);
    if (!objectName || objectName.includes('\0') || path.isAbsolute(objectName) || objectName.split(/[\\/]/).includes('..')) {
      throw new Error('Caminho de objeto inválido.');
    }
    const bucketDir = path.join(this.root, bucketName);
    const full = path.resolve(bucketDir, objectName);
    if (!full.startsWith(bucketDir + path.sep)) throw new Error('Caminho de objeto fora do armazenamento.');
    return full;
  }

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    const target = this.resolvePath(params.bucketName, params.objectName);
    await mkdir(path.dirname(target), { recursive: true });

    const temp = `${target}.${randomUUID()}.tmp`;
    await writeFile(temp, params.buffer, { flag: 'wx' });
    await rename(temp, target);

    const meta: StoredMetadata = {
      mimeType: params.mimeType,
      size: params.size,
      metadata: params.metadata ?? {},
      createdAt: new Date().toISOString(),
    };
    await writeFile(`${target}${META_SUFFIX}`, JSON.stringify(meta));

    return {
      storagePath: `${params.bucketName}/${params.objectName}`,
      etag: createHmac('sha256', 'etag').update(params.buffer).digest('hex').slice(0, 32),
    };
  }

  private sign(bucketName: string, objectName: string, expires: number): string {
    return createHmac('sha256', this.config.signingSecret)
      .update(`${bucketName}\n${objectName}\n${expires}`)
      .digest('base64url');
  }

  async getSignedUrl(params: GetSignedUrlParams): Promise<string> {
    this.resolvePath(params.bucketName, params.objectName); // valida
    const expires = Math.floor(Date.now() / 1000) + params.expiresIn;
    const query = new URLSearchParams({
      b: params.bucketName,
      k: params.objectName,
      e: String(expires),
      s: this.sign(params.bucketName, params.objectName, expires),
    });
    return `${this.downloadPath}?${query.toString()}`;
  }

  /** Valida assinatura e expiração de um URL de download. `null` = inválido/expirado/inexistente. */
  async openSignedDownload(query: { b?: string; k?: string; e?: string; s?: string }): Promise<VerifiedDownload | null> {
    const { b, k, e, s } = query;
    if (!b || !k || !e || !s || !/^\d+$/.test(e)) return null;
    if (Number(e) < Math.floor(Date.now() / 1000)) return null;

    const expected = Buffer.from(this.sign(b, k, Number(e)));
    const provided = Buffer.from(s);
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

    let full: string;
    try {
      full = this.resolvePath(b, k);
    } catch {
      return null;
    }

    try {
      const [info, metaRaw] = await Promise.all([stat(full), readFile(`${full}${META_SUFFIX}`, 'utf8').catch(() => null)]);
      const meta = metaRaw ? (JSON.parse(metaRaw) as StoredMetadata) : null;
      const originalName = meta?.metadata.originalName ? decodeURIComponent(meta.metadata.originalName) : path.basename(full);
      return {
        stream: createReadStream(full),
        mimeType: meta?.mimeType ?? 'application/octet-stream',
        size: info.size,
        fileName: originalName,
      };
    } catch {
      return null;
    }
  }

  async delete(bucketName: string, objectName: string): Promise<void> {
    const full = this.resolvePath(bucketName, objectName);
    await rm(full, { force: true });
    await rm(`${full}${META_SUFFIX}`, { force: true });
  }

  async exists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await stat(this.resolvePath(bucketName, objectName));
      return true;
    } catch {
      return false;
    }
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    if (!BUCKET_RE.test(bucketName)) throw new Error(`Nome de bucket inválido: ${bucketName}`);
    await mkdir(path.join(this.root, bucketName), { recursive: true });
  }

  async getObject(bucketName: string, objectName: string): Promise<Buffer> {
    return readFile(this.resolvePath(bucketName, objectName));
  }
}
