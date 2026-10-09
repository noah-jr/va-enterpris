import { InvalidTokenError, ValidationError } from '../../../domain/errors/index.js';
import type { IClientRepository } from '../../../domain/repositories/index.js';
import type { ITokenRepository } from '../../../domain/repositories/index.js';
import type { IHasher, ITokenService, IUnitOfWork } from '../../contracts/index.js';
import type { IAuditRepository } from '../../../domain/repositories/index.js';

export interface SetPasswordInput {
  token: string;
  password: string;
}

/**
 * Definição da PRIMEIRA senha, após a verificação de email. O token de verificação
 * só é aceite enquanto a conta não tiver senha — depois disso, alterações de senha
 * passam obrigatoriamente pelo fluxo de recuperação (token próprio, 15 min, uso único).
 */
export class SetClientPasswordUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly tokenRepository: ITokenRepository,
    private readonly hasher: IHasher,
    private readonly auditRepository: IAuditRepository,
    private readonly tokenService: ITokenService,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: SetPasswordInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const record = await this.tokenRepository.findByTokenHash(
      'EMAIL_VERIFICATION',
      this.tokenService.hashToken(input.token),
    );

    if (record === null || record.expiresAt < new Date()) {
      throw new InvalidTokenError('Link de configuração inválido ou expirado.');
    }

    const client = await this.clientRepository.findById(record.ownerId);

    if (client === null) {
      throw new InvalidTokenError();
    }

    if (!client.emailVerified) {
      throw new ValidationError('O email ainda não foi verificado.');
    }

    if (client.passwordHash !== null) {
      throw new InvalidTokenError(
        'A senha desta conta já foi definida. Use "Esqueci-me da senha" para a alterar.',
      );
    }

    const passwordHash = await this.hasher.hash(input.password);

    await this.unitOfWork.run(async () => {
      const updated = await this.clientRepository.setInitialPassword(record.ownerId, passwordHash);
      if (!updated) {
        throw new InvalidTokenError(
          'A senha desta conta já foi definida. Use "Esqueci-me da senha" para a alterar.',
        );
      }

      await this.auditRepository.log({
        clientId: record.ownerId,
        action: 'PASSWORD_CHANGED',
        entity: 'Client',
        entityId: record.ownerId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    });
  }
}
