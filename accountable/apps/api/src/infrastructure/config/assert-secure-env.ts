import { isLocalEnvironment } from './runtime.js';

const INSECURE_DEFAULTS: Record<string, string> = {
  JWT_ACCESS_SECRET: 'default-access-secret-min-32-chars',
  JWT_REFRESH_SECRET: 'default-refresh-secret-min-32-chars',
  COOKIE_SECRET: 'development-cookie-secret-min-32-chars-long',
  UPLOAD_TOKEN_ENCRYPTION_KEY: 'development-upload-token-key-min-32-chars',
  OTP_SECRET: 'development-otp-secret-min-32-chars-long',
};

/** Segredos exigidos apenas pelo driver de armazenamento em uso. */
const STORAGE_DEFAULTS: Record<'local' | 'minio', Record<string, string>> = {
  local: { STORAGE_SIGNING_SECRET: 'development-storage-signing-secret-32ch' },
  minio: { MINIO_ACCESS_KEY: 'minioadmin', MINIO_SECRET_KEY: 'minioadmin123' },
};

const MIN_SECRET_LENGTH = 32;
const LENGTH_CHECKED_KEYS = new Set([
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'COOKIE_SECRET',
  'UPLOAD_TOKEN_ENCRYPTION_KEY',
  'OTP_SECRET',
  'STORAGE_SIGNING_SECRET',
]);

/**
 * Falha o arranque fora de development/test se algum segredo crítico não estiver
 * definido, ainda tiver o valor de desenvolvimento por omissão, ou for demasiado curto.
 * `NODE_ENV` não definido é tratado como produção.
 */
export function assertSecureEnv(): void {
  if (isLocalEnvironment()) return;

  const problems: string[] = [];

  const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase() === 'minio' ? 'minio' : 'local';
  const required = { ...INSECURE_DEFAULTS, ...STORAGE_DEFAULTS[driver] };

  for (const [key, insecureDefault] of Object.entries(required)) {
    const value = process.env[key];

    if (!value) {
      problems.push(`${key} não está definido.`);
      continue;
    }

    if (value === insecureDefault) {
      problems.push(`${key} está a usar o valor de desenvolvimento por omissão.`);
      continue;
    }

    if (LENGTH_CHECKED_KEYS.has(key) && value.length < MIN_SECRET_LENGTH) {
      problems.push(`${key} tem menos de ${MIN_SECRET_LENGTH} caracteres.`);
    }
  }

  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    problems.push('JWT_ACCESS_SECRET e JWT_REFRESH_SECRET têm de ser diferentes.');
  }

  if (problems.length > 0) {
    throw new Error(
      `Configuração insegura para produção (NODE_ENV=${process.env.NODE_ENV ?? 'não definido'}):\n` +
        problems.map((p) => `  - ${p}`).join('\n') +
        `\nDefina estas variáveis em .env antes de arrancar em produção.`,
    );
  }
}
