import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assertSecureEnv } from './assert-secure-env.js';

const ENV_KEYS = [
  'NODE_ENV',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'COOKIE_SECRET',
  'UPLOAD_TOKEN_ENCRYPTION_KEY',
  'OTP_SECRET',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
  'STORAGE_SIGNING_SECRET',
  'STORAGE_DRIVER',
] as const;

const VALID_SECRETS = {
  JWT_ACCESS_SECRET: 'a-real-production-access-secret-value-1',
  JWT_REFRESH_SECRET: 'a-real-production-refresh-secret-value',
  COOKIE_SECRET: 'a-real-production-cookie-secret-value-1',
  UPLOAD_TOKEN_ENCRYPTION_KEY: 'a-real-production-upload-token-key-000',
  OTP_SECRET: 'a-real-production-otp-secret-value-00000',
  MINIO_ACCESS_KEY: 'prod-minio-access-key',
  MINIO_SECRET_KEY: 'prod-minio-secret-key',
  STORAGE_SIGNING_SECRET: 'a-real-production-storage-signing-secret',
};

describe('assertSecureEnv', () => {
  const originalValues: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) originalValues[key] = process.env[key];
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalValues[key] === undefined) delete process.env[key];
      else process.env[key] = originalValues[key];
    }
  });

  it('não faz nada fora de produção, mesmo sem segredos definidos', () => {
    process.env.NODE_ENV = 'development';
    for (const key of ENV_KEYS) {
      if (key !== 'NODE_ENV') delete process.env[key];
    }
    expect(() => assertSecureEnv()).not.toThrow();
  });

  it('lança erro em produção quando os segredos usam os valores de desenvolvimento por omissão', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'default-access-secret-min-32-chars';
    process.env.JWT_REFRESH_SECRET = 'default-refresh-secret-min-32-chars';
    process.env.COOKIE_SECRET = 'development-cookie-secret-min-32-chars-long';
    process.env.MINIO_ACCESS_KEY = 'minioadmin';
    process.env.MINIO_SECRET_KEY = 'minioadmin123';

    expect(() => assertSecureEnv()).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('lança erro em produção quando um segredo não está definido', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_ACCESS_SECRET;
    process.env.JWT_REFRESH_SECRET = VALID_SECRETS.JWT_REFRESH_SECRET;
    process.env.COOKIE_SECRET = VALID_SECRETS.COOKIE_SECRET;
    process.env.UPLOAD_TOKEN_ENCRYPTION_KEY = VALID_SECRETS.UPLOAD_TOKEN_ENCRYPTION_KEY;
    process.env.OTP_SECRET = VALID_SECRETS.OTP_SECRET;
    process.env.MINIO_ACCESS_KEY = VALID_SECRETS.MINIO_ACCESS_KEY;
    process.env.MINIO_SECRET_KEY = VALID_SECRETS.MINIO_SECRET_KEY;
    process.env.STORAGE_SIGNING_SECRET = VALID_SECRETS.STORAGE_SIGNING_SECRET;

    expect(() => assertSecureEnv()).toThrow(/JWT_ACCESS_SECRET não está definido/);
  });

  it('lança erro em produção quando um segredo é demasiado curto', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'curto';
    process.env.JWT_REFRESH_SECRET = VALID_SECRETS.JWT_REFRESH_SECRET;
    process.env.COOKIE_SECRET = VALID_SECRETS.COOKIE_SECRET;
    process.env.UPLOAD_TOKEN_ENCRYPTION_KEY = VALID_SECRETS.UPLOAD_TOKEN_ENCRYPTION_KEY;
    process.env.OTP_SECRET = VALID_SECRETS.OTP_SECRET;
    process.env.MINIO_ACCESS_KEY = VALID_SECRETS.MINIO_ACCESS_KEY;
    process.env.MINIO_SECRET_KEY = VALID_SECRETS.MINIO_SECRET_KEY;
    process.env.STORAGE_SIGNING_SECRET = VALID_SECRETS.STORAGE_SIGNING_SECRET;

    expect(() => assertSecureEnv()).toThrow(/menos de 32 caracteres/);
  });

  it('trata NODE_ENV não definido como produção', () => {
    delete process.env.NODE_ENV;
    for (const key of ENV_KEYS) {
      if (key !== 'NODE_ENV') delete process.env[key];
    }
    expect(() => assertSecureEnv()).toThrow(/NODE_ENV=não definido/);
  });

  it('trata valores desconhecidos de NODE_ENV (p.ex. staging) como produção', () => {
    process.env.NODE_ENV = 'staging';
    for (const key of ENV_KEYS) {
      if (key !== 'NODE_ENV') delete process.env[key];
    }
    expect(() => assertSecureEnv()).toThrow(/não está definido/);
  });

  it('lança erro quando os segredos de access e refresh são iguais', () => {
    process.env.NODE_ENV = 'production';
    Object.assign(process.env, VALID_SECRETS);
    process.env.JWT_REFRESH_SECRET = VALID_SECRETS.JWT_ACCESS_SECRET;

    expect(() => assertSecureEnv()).toThrow(/têm de ser diferentes/);
  });

  it('não lança erro em produção quando todos os segredos são fortes e distintos dos defaults', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = VALID_SECRETS.JWT_ACCESS_SECRET;
    process.env.JWT_REFRESH_SECRET = VALID_SECRETS.JWT_REFRESH_SECRET;
    process.env.COOKIE_SECRET = VALID_SECRETS.COOKIE_SECRET;
    process.env.UPLOAD_TOKEN_ENCRYPTION_KEY = VALID_SECRETS.UPLOAD_TOKEN_ENCRYPTION_KEY;
    process.env.OTP_SECRET = VALID_SECRETS.OTP_SECRET;
    process.env.MINIO_ACCESS_KEY = VALID_SECRETS.MINIO_ACCESS_KEY;
    process.env.MINIO_SECRET_KEY = VALID_SECRETS.MINIO_SECRET_KEY;
    process.env.STORAGE_SIGNING_SECRET = VALID_SECRETS.STORAGE_SIGNING_SECRET;

    expect(() => assertSecureEnv()).not.toThrow();
  });

  it('armazenamento local (padrão) exige STORAGE_SIGNING_SECRET mas não as chaves do MinIO', () => {
    process.env.NODE_ENV = 'production';
    Object.assign(process.env, VALID_SECRETS);
    delete process.env.STORAGE_DRIVER;
    delete process.env.MINIO_ACCESS_KEY;
    delete process.env.MINIO_SECRET_KEY;
    expect(() => assertSecureEnv()).not.toThrow();

    delete process.env.STORAGE_SIGNING_SECRET;
    expect(() => assertSecureEnv()).toThrow(/STORAGE_SIGNING_SECRET/);
  });

  it('com STORAGE_DRIVER=minio exige as chaves do MinIO', () => {
    process.env.NODE_ENV = 'production';
    Object.assign(process.env, VALID_SECRETS);
    process.env.STORAGE_DRIVER = 'minio';
    delete process.env.STORAGE_SIGNING_SECRET;
    expect(() => assertSecureEnv()).not.toThrow();

    delete process.env.MINIO_ACCESS_KEY;
    expect(() => assertSecureEnv()).toThrow(/MINIO_ACCESS_KEY/);
  });
});
