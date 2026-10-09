import type { EmailTokenKind, IAuditRepository } from '../../../domain/repositories/index.js';
import type { IEmailService, IHasher, IUnitOfWork } from '../../contracts/index.js';
import type { AuthSessionService } from '../../services/auth-session.service.js';
import type { EmailTokenService } from '../../services/email-token.service.js';

export const PASSWORD_RESET_TTL_MINUTES = 15;

/**
 * Adaptador que permite usar o mesmo fluxo de recuperação para clientes e para
 * utilizadores internos (tabelas, URLs e auditoria diferentes).
 */
export interface PasswordResetAudience {
  kind: Extract<EmailTokenKind, 'CLIENT_PASSWORD_RESET' | 'USER_PASSWORD_RESET'>;
  sessionType: 'client' | 'user';
  /** Base do URL da página de redefinição (portal do cliente ou painel admin). */
  resetPageUrl: string;
  /** Devolve a conta apenas se puder recuperar a senha (existe, ativa, verificada). */
  findEligibleByEmail(email: string): Promise<{ id: string; name: string; email: string } | null>;
  findIdByEmail(email: string): Promise<string | null>;
  setPassword(id: string, passwordHash: string): Promise<void>;
  auditActor(id: string): { clientId?: string; userId?: string };
  entity: 'Client' | 'User';
}

// ============================================================
// Pedido de recuperação — envia link + código
// ============================================================

export class RequestPasswordResetUseCase {
  constructor(
    private readonly audience: PasswordResetAudience,
    private readonly emailTokens: EmailTokenService,
    private readonly emailService: IEmailService,
    private readonly auditRepository: IAuditRepository,
  ) {}

  /** Responde sempre da mesma forma — nunca revela se o email existe. */
  async execute(email: string, context: { ipAddress?: string; userAgent?: string } = {}): Promise<void> {
    const account = await this.audience.findEligibleByEmail(email);
    if (!account) return;

    const issued = await this.emailTokens.issue(
      this.audience.kind,
      account.id,
      PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
    );

    await this.auditRepository.log({
      ...this.audience.auditActor(account.id),
      action: 'USER_PASSWORD_RESET_REQUESTED',
      entity: this.audience.entity,
      entityId: account.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    await this.emailService.sendPasswordReset({
      to: account.email,
      name: account.name,
      resetUrl: `${this.audience.resetPageUrl}?token=${issued.rawToken}`,
      code: issued.code,
      expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
    });
  }
}

// ============================================================
// Conclusão — por link (token) ou por email + código
// ============================================================

export type CompletePasswordResetInput =
  | { token: string; password: string }
  | { email: string; code: string; password: string };

export class CompletePasswordResetUseCase {
  constructor(
    private readonly audience: PasswordResetAudience,
    private readonly emailTokens: EmailTokenService,
    private readonly hasher: IHasher,
    private readonly auditRepository: IAuditRepository,
    private readonly sessionService: AuthSessionService,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: CompletePasswordResetInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const record =
      'token' in input
        ? await this.emailTokens.findValidByLink(this.audience.kind, input.token)
        : await this.emailTokens.findValidByCode(
            this.audience.kind,
            await this.audience.findIdByEmail(input.email),
            input.code,
          );

    const passwordHash = await this.hasher.hash(input.password);

    await this.unitOfWork.run(async () => {
      await this.emailTokens.consume(this.audience.kind, record);
      await this.audience.setPassword(record.ownerId, passwordHash);
      // Quem tinha a senha antiga (ou uma sessão roubada) perde o acesso.
      await this.sessionService.revokeAllForSubject(this.audience.sessionType, record.ownerId);

      await this.auditRepository.log({
        ...this.audience.auditActor(record.ownerId),
        action: 'PASSWORD_RESET',
        entity: this.audience.entity,
        entityId: record.ownerId,
        metadata: { method: 'token' in input ? 'link' : 'otp' },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    });
  }
}
