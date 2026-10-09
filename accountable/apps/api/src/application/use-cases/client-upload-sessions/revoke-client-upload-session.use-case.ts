import { NotFoundError } from '../../../domain/errors/index.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type {
  IClientUploadSessionRepository,
} from '../../../domain/repositories/client-upload-session.repository.interface.js';
import type { IUnitOfWork } from '../../contracts/index.js';

export class RevokeClientUploadSessionUseCase {
  constructor(
    private readonly clientUploadSessionRepository: IClientUploadSessionRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: { clientId: string; sessionId: string },
    context: {
      actorId: string;
      actorType: 'client' | 'user';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<void> {
    const session = await this.clientUploadSessionRepository.findById(input.sessionId);
    // A sessão tem de pertencer ao cliente da rota — impede revogar sessões de outros clientes.
    if (!session || session.clientId !== input.clientId) {
      throw new NotFoundError('Sessão de Envio', input.sessionId);
    }

    if (session.revokedAt) {
      return;
    }

    await this.unitOfWork.run(async () => {
      await this.clientUploadSessionRepository.revoke(session.id);

      await this.auditRepository.log({
        ...(context.actorType === 'user' ? { userId: context.actorId } : {}),
        clientId: session.clientId,
        action: 'CLIENT_UPLOAD_SESSION_REVOKED',
        entity: 'ClientUploadSession',
        entityId: session.id,
        metadata: { revokedBy: context.actorType },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    });
  }
}
