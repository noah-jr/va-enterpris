import { NotFoundError } from '../../../domain/errors/index.js';
import type { ClientUploadSessionEntity } from '../../../domain/repositories/client-upload-session.repository.interface.js';

export const DEFAULT_UPLOAD_SESSION_TTL_DAYS = 30;
export const MAX_UPLOAD_SESSION_TTL_DAYS = 365;

export function buildUploadSessionUrl(
  clientPortalUrl: string,
  token: string,
  details: { month: number | null; year: number | null; companyName: string },
): string {
  const queryParams = new URLSearchParams();
  queryParams.set('token', token);
  if (details.month) queryParams.set('month', details.month.toString());
  if (details.year) queryParams.set('year', details.year.toString());
  queryParams.set('companyName', details.companyName);

  const baseUrl = clientPortalUrl.replace(/\/+$/, '');
  return `${baseUrl}/publico/documentos/upload?${queryParams.toString()}`;
}

export function isUploadSessionUsable(session: ClientUploadSessionEntity, now: Date = new Date()): boolean {
  return session.revokedAt === null && session.expiresAt.getTime() > now.getTime();
}

/** Mesmo erro para token inexistente, revogado ou expirado — não revela qual. */
export function invalidSessionError(): NotFoundError {
  const error = new NotFoundError('Sessão de Envio');
  Object.defineProperty(error, 'message', {
    value: 'Link de envio inválido, expirado ou revogado.',
    writable: false,
  });
  return error;
}
