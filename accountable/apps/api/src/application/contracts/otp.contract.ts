// ============================================================
// IOtpService — códigos de uso único (6 dígitos) enviados por email
// ============================================================

/** Tentativas erradas permitidas por código antes de ser necessário pedir um novo. */
export const MAX_OTP_ATTEMPTS = 5;

export interface IOtpService {
  /** Gera um código de 6 dígitos e o respetivo hash para persistir. */
  generate(): { code: string; hash: string };
  /** Comparação em tempo constante. */
  verify(code: string, hash: string): boolean;
}
