import { UnauthorizedError, ValidationError } from '../../../domain/errors/index.js';
import type { IClientRepository, IUserRepository, IAuditRepository } from '../../../domain/repositories/index.js';
import type { IHasher, IUnitOfWork } from '../../contracts/index.js';
import type { AuthSessionService } from '../../services/auth-session.service.js';

/**
 * Alteração de senha pelo próprio (cliente ou utilizador interno). Exige a senha atual
 * e termina todas as sessões — o controller emite logo uma sessão nova para o dispositivo atual.
 */
export class ChangeOwnPasswordUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher,
    private readonly sessionService: AuthSessionService,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: { currentPassword: string; newPassword: string },
    context: { actorId: string; actorType: 'client' | 'user'; ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const currentHash =
      context.actorType === 'client'
        ? (await this.clientRepository.findById(context.actorId))?.passwordHash
        : (await this.userRepository.findById(context.actorId))?.passwordHash;

    if (!currentHash || !(await this.hasher.compare(input.currentPassword, currentHash))) {
      throw new UnauthorizedError('A senha atual está incorreta.');
    }
    if (input.currentPassword === input.newPassword) {
      throw new ValidationError('A nova senha tem de ser diferente da atual.');
    }

    const passwordHash = await this.hasher.hash(input.newPassword);

    await this.unitOfWork.run(async () => {
      if (context.actorType === 'client') {
        await this.clientRepository.update(context.actorId, { passwordHash });
      } else {
        await this.userRepository.update(context.actorId, { passwordHash });
      }
      await this.sessionService.revokeAllForSubject(context.actorType, context.actorId);

      await this.auditRepository.log({
        ...(context.actorType === 'client' ? { clientId: context.actorId } : { userId: context.actorId }),
        action: 'PASSWORD_CHANGED',
        entity: context.actorType === 'client' ? 'Client' : 'User',
        entityId: context.actorId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    });
  }
}
