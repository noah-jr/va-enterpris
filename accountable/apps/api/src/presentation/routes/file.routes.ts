import type { FastifyPluginAsync } from 'fastify';
import type { LocalFileStorage } from '../../infrastructure/storage/local.file-storage.js';

interface FileRoutesOptions {
  storage: LocalFileStorage;
}

/** Tipos que o browser pode mostrar diretamente; os restantes são descarregados. */
const INLINE_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

/** Nome seguro para Content-Disposition (ASCII + versão UTF-8 RFC 5987). */
function contentDisposition(kind: 'inline' | 'attachment', fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

/**
 * GET /api/v1/files/download?b=&k=&e=&s= — serve um documento guardado localmente.
 * O acesso é autorizado pela assinatura HMAC do URL (gerado após verificação de
 * permissões em GET /documents/:id), com validade de 15 minutos — como um URL pré-assinado S3.
 */
export const fileRoutes: FastifyPluginAsync<FileRoutesOptions> = async (fastify, { storage }) => {
  fastify.get<{ Querystring: { b?: string; k?: string; e?: string; s?: string } }>('/download', async (request, reply) => {
    const file = await storage.openSignedDownload(request.query);
    if (!file) {
      return reply.status(404).send({
        code: 'NOT_FOUND',
        message: 'Ligação de download inválida ou expirada. Abra novamente o processo para obter uma nova.',
        timestamp: new Date().toISOString(),
      });
    }

    return reply
      .header('Content-Type', file.mimeType)
      .header('Content-Length', file.size)
      .header(
        'Content-Disposition',
        contentDisposition(INLINE_TYPES.has(file.mimeType) ? 'inline' : 'attachment', file.fileName),
      )
      .header('Cache-Control', 'private, no-store')
      .header('Content-Security-Policy', "sandbox; default-src 'none'")
      .header('X-Content-Type-Options', 'nosniff')
      .send(file.stream);
  });
};
