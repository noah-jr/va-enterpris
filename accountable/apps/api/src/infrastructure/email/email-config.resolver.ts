import type { ISecretCipher } from '../../application/contracts/index.js';
import type { IEmailSettingsRepository } from '../../domain/repositories/index.js';
import type { SmtpConfig } from './nodemailer.email-service.js';

/**
 * A configuração guardada no painel (ativa) tem precedência sobre as variáveis SMTP_*.
 * É lida a cada envio para que alterações no painel tenham efeito imediato.
 */
export function createSmtpConfigResolver(
  repository: IEmailSettingsRepository,
  cipher: ISecretCipher,
  fallback: SmtpConfig,
): () => Promise<SmtpConfig> {
  return async () => {
    const settings = await repository.get();
    if (!settings || !settings.isEnabled) return fallback;

    return {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      user: settings.username ?? '',
      pass: settings.passwordEncrypted ? (cipher.decrypt(settings.passwordEncrypted) ?? '') : '',
      fromName: settings.fromName,
      fromEmail: settings.fromEmail,
    };
  };
}
