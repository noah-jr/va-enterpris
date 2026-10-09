import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IRefreshSessionRepository } from '../../../domain/repositories/refresh-session.repository.interface.js';
import type { ClientListItemDTO } from '@accountable/types';
import { NotFoundError } from '../../../domain/errors/index.js';

export class BlockClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly refreshSessionRepository: IRefreshSessionRepository,
  ) {}

  async execute(
    clientId: string,
    input: { reason: string },
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<ClientListItemDTO> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente', clientId);
    }

    return this.unitOfWork.run(async () => {
      const updated = await this.clientRepository.update(clientId, {
        isActive: false,
      });

      // Termina todas as sessões do cliente: o bloqueio tem efeito imediato na renovação.
      await this.refreshSessionRepository.revokeAllForSubject('CLIENT', clientId);

      await this.auditRepository.log({
        userId: context.actorId,
        clientId: client.id,
        action: 'CLIENT_BLOCKED',
        entity: 'Client',
        entityId: client.id,
        oldValues: { isActive: client.isActive },
        newValues: { isActive: false },
        metadata: { reason: input.reason },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return {
        id: updated.id,
        nip: updated.nip,
        name: updated.name,
        email: updated.email,
        company: updated.company,
        isActive: updated.isActive,
        emailVerified: updated.emailVerified,
        documentsCount: 0,
        createdAt: updated.createdAt.toISOString(),
      };
    });
  }
}
