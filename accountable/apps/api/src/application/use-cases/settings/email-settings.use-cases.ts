import type { EmailSettingsDTO } from '@accountable/types';
import type { EmailSettingsInput } from '@accountable/schemas';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import type {
  EmailSettingsEntity,
  IAuditRepository,
  IEmailSettingsRepository,
} from '../../../domain/repositories/index.js';
import type { IEmailService, ISecretCipher, IUnitOfWork } from '../../contracts/index.js';

/** Configuração em uso quando nada foi guardado no painel (variáveis SMTP_*). */
export interface EnvironmentEmailDefaults {
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
}

export const GMAIL_PRESET = { host: 'smtp.gmail.com', port: 465, secure: true } as const;

function toDTO(settings: EmailSettingsEntity): EmailSettingsDTO {
  return {
    provider: settings.provider,
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    username: settings.username,
    hasPassword: Boolean(settings.passwordEncrypted),
    fromName: settings.fromName,
    fromEmail: settings.fromEmail,
    isEnabled: settings.isEnabled,
    otpEnabled: settings.otpEnabled ?? true,
    verificationExpiresHours: settings.verificationExpiresHours ?? 24,
    passwordResetExpiresMinutes: settings.passwordResetExpiresMinutes ?? 15,
    source: settings.isEnabled ? 'database' : 'environment',
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export class GetEmailSettingsUseCase {
  constructor(
    private readonly repository: IEmailSettingsRepository,
    private readonly envDefaults: EnvironmentEmailDefaults,
  ) {}

  async execute(): Promise<EmailSettingsDTO> {
    const settings = await this.repository.get();
    if (settings) return toDTO(settings);
    return {
      provider: 'SMTP',
      ...this.envDefaults,
      isEnabled: false,
      otpEnabled: true,
      verificationExpiresHours: 24,
      passwordResetExpiresMinutes: 15,
      source: 'environment',
      updatedAt: null,
    };
  }
}

export class UpdateEmailSettingsUseCase {
  constructor(
    private readonly repository: IEmailSettingsRepository,
    private readonly cipher: ISecretCipher,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: EmailSettingsInput, context: { actorId: string; ipAddress?: string; userAgent?: string }): Promise<EmailSettingsDTO> {
    const current = await this.repository.get();

    // Gmail: servidor/porta fixos; a senha tem de ser uma "palavra-passe de aplicação".
    const connection =
      input.provider === 'GMAIL'
        ? GMAIL_PRESET
        : { host: input.host, port: input.port, secure: input.secure };

    // Senha vazia/omitida = manter a atual.
    const passwordEncrypted = input.password
      ? this.cipher.encrypt(input.password)
      : (current?.passwordEncrypted ?? null);

    if (input.provider === 'GMAIL' && !passwordEncrypted) {
      throw new BusinessRuleError('Indique a palavra-passe de aplicação da conta Gmail.');
    }

    return this.unitOfWork.run(async () => {
      const saved = await this.repository.save({
        provider: input.provider,
        ...connection,
        username: input.username || null,
        passwordEncrypted,
        fromName: input.fromName,
        fromEmail: input.fromEmail,
        isEnabled: input.isEnabled,
        otpEnabled: input.otpEnabled ?? true,
        verificationExpiresHours: input.verificationExpiresHours ?? 24,
        passwordResetExpiresMinutes: input.passwordResetExpiresMinutes ?? 15,
        updatedById: context.actorId,
      });

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'EMAIL_SETTINGS_UPDATED',
        entity: 'EmailSettings',
        // Nunca registar a senha na auditoria.
        newValues: {
          provider: saved.provider,
          host: saved.host,
          port: saved.port,
          secure: saved.secure,
          username: saved.username,
          fromEmail: saved.fromEmail,
          isEnabled: saved.isEnabled,
          otpEnabled: saved.otpEnabled,
          verificationExpiresHours: saved.verificationExpiresHours,
          passwordResetExpiresMinutes: saved.passwordResetExpiresMinutes,
          passwordChanged: Boolean(input.password),
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return toDTO(saved);
    });
  }
}

export interface SendTestEmailInput {
  to: string;
  type?: 'GENERIC' | 'ACCOUNT_VERIFICATION' | 'PASSWORD_RESET';
}

export class SendTestEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditRepository: IAuditRepository,
  ) {}

  /** Envia com a configuração em vigor. Devolve a mensagem de erro do servidor em caso de falha. */
  async execute(
    input: string | SendTestEmailInput,
    context: { actorId: string; actorEmail: string; ipAddress?: string; userAgent?: string },
  ): Promise<{ success: true; code?: string } | { success: false; error: string }> {
    const to = typeof input === 'string' ? input : input.to;
    const type = typeof input === 'string' ? 'GENERIC' : (input.type ?? 'GENERIC');
    const code = type !== 'GENERIC' ? String(Math.floor(100000 + Math.random() * 900000)) : undefined;

    let result: { success: true; code?: string } | { success: false; error: string };
    try {
      await this.emailService.sendTestEmail({
        to,
        requestedBy: context.actorEmail,
        type,
        code,
      });
      result = { success: true, ...(code ? { code } : {}) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result = { success: false, error: message.slice(0, 500) };
    }

    await this.auditRepository.log({
      userId: context.actorId,
      action: 'EMAIL_SETTINGS_TESTED',
      entity: 'EmailSettings',
      metadata: { to, type, success: result.success, ...(result.success ? { code } : { error: result.error }) },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return result;
  }
}
