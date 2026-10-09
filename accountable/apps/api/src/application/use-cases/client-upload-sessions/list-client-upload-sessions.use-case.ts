import type { ClientUploadSessionDTO } from '@accountable/types';
import { NotFoundError } from '../../../domain/errors/index.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type {
  IClientUploadSessionRepository,
} from '../../../domain/repositories/client-upload-session.repository.interface.js';
import type { ISecretCipher } from '../../contracts/index.js';
import { buildUploadSessionUrl, isUploadSessionUsable } from './upload-session-url.js';

export class ListClientUploadSessionsUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly clientUploadSessionRepository: IClientUploadSessionRepository,
    private readonly secretCipher: ISecretCipher,
    private readonly clientPortalUrl: string,
  ) {}

  async execute(clientId: string): Promise<ClientUploadSessionDTO[]> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente', clientId);
    }

    const sessions = await this.clientUploadSessionRepository.listByClientId(clientId);
    const companyName = client.company || client.name;

    return sessions.map((session) => {
      // O URL só é reconstruído para sessões ainda utilizáveis. Sessões legadas
      // (sem token cifrado) continuam válidas mas o link não pode ser recopiado.
      const token =
        isUploadSessionUsable(session) && session.tokenEncrypted
          ? this.secretCipher.decrypt(session.tokenEncrypted)
          : null;

      return {
        id: session.id,
        clientId: session.clientId,
        clientName: session.client.name,
        companyName: session.client.company ?? undefined,
        month: session.month,
        year: session.year,
        label: session.label,
        url: token
          ? buildUploadSessionUrl(this.clientPortalUrl, token, {
              month: session.month,
              year: session.year,
              companyName,
            })
          : undefined,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        revokedAt: session.revokedAt ? session.revokedAt.toISOString() : null,
        documentsCount: session._count?.documents ?? 0,
      };
    });
  }
}
