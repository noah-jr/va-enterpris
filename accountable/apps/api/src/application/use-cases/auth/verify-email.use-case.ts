import type { IClientRepository, IAuditRepository } from '../../../domain/repositories/index.js';
import type { IUnitOfWork } from '../../contracts/index.js';
import type { EmailTokenService } from '../../services/email-token.service.js';

export interface VerifyEmailOutput {
  clientId: string;
  /** Token para a página de definição de senha — só é aceite enquanto a conta não tiver senha. */
  setupToken: string;
}

export type VerifyEmailInput = { token: string } | { email: string; code: string };

/** Ativação por link (token do email) OU por email + código OTP de 6 dígitos. */
export class VerifyEmailUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly emailTokens: EmailTokenService,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: VerifyEmailInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<VerifyEmailOutput> {
    const byLink = 'token' in input;
    const record = byLink
      ? await this.emailTokens.findValidByLink('EMAIL_VERIFICATION', input.token)
      : await this.emailTokens.findValidByCode(
          'EMAIL_VERIFICATION',
          (await this.clientRepository.findByEmail(input.email))?.id ?? null,
          input.code,
        );

    const setupToken = await this.unitOfWork.run(async () => {
      await this.emailTokens.consume('EMAIL_VERIFICATION', record);
      await this.clientRepository.update(record.ownerId, { emailVerified: true, isActive: true });

      await this.auditRepository.log({
        clientId: record.ownerId,
        action: 'EMAIL_VERIFIED',
        entity: 'Client',
        entityId: record.ownerId,
        metadata: { method: byLink ? 'link' : 'otp' },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      // Pelo link, o próprio token serve de setup token. Por OTP não temos o token em
      // claro (só o hash), por isso é emitido um novo que substitui o do link.
      return byLink ? input.token : this.emailTokens.reissueLink('EMAIL_VERIFICATION', record);
    });

    return { clientId: record.ownerId, setupToken };
  }
}
