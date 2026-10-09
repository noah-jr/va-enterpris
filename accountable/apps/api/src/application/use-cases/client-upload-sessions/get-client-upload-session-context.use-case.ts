import type { DocumentStatus, PublicClientUploadSessionContextDTO } from '@accountable/types';
import type {
  IClientUploadSessionRepository,
} from '../../../domain/repositories/client-upload-session.repository.interface.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { ITokenService } from '../../contracts/index.js';
import { invalidSessionError, isUploadSessionUsable } from './upload-session-url.js';

export class GetClientUploadSessionContextUseCase {
  constructor(
    private readonly clientUploadSessionRepository: IClientUploadSessionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(token: string): Promise<PublicClientUploadSessionContextDTO> {
    if (!token || typeof token !== 'string') {
      throw invalidSessionError();
    }

    const session = await this.clientUploadSessionRepository.findByTokenHash(
      this.tokenService.hashToken(token),
    );
    if (!session || !isUploadSessionUsable(session) || !session.client) {
      throw invalidSessionError();
    }

    // Links de clientes bloqueados deixam de funcionar.
    const client = await this.clientRepository.findById(session.clientId);
    if (!client || !client.isActive) {
      throw invalidSessionError();
    }

    const recentUploads = (session.documents || []).map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status as DocumentStatus,
      createdAt: doc.createdAt.toISOString(),
      filesCount: doc._count?.files ?? doc.files?.length ?? 0,
    }));

    return {
      sessionId: session.id,
      clientName: session.client.name,
      companyName: session.client.company,
      month: session.month,
      year: session.year,
      label: session.label,
      expiresAt: session.expiresAt.toISOString(),
      recentUploads,
    };
  }
}
