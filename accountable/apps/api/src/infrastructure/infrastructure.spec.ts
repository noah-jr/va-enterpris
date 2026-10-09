import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { PrismaClient } from '@prisma/client';
import { JwtTokenService } from './auth/jwt.token-service.js';
import { AesGcmSecretCipher } from './crypto/aes-gcm.secret-cipher.js';
import { isLocalEnvironment, parseTrustProxy, redactUrlSecrets } from './config/runtime.js';
import { PrismaUnitOfWork, createTransactionAwarePrisma } from './database/prisma-unit-of-work.js';
import { contentMatchesMimeType } from '../application/use-cases/documents/file-signature.js';
import { SAMPLE_FILES } from '../__tests__/unit/fakes.js';

const ACCESS = 'test-access-secret-with-at-least-32-chars';
const REFRESH = 'test-refresh-secret-with-at-least-32-chars';

describe('JwtTokenService', () => {
  const service = new JwtTokenService({
    accessSecret: ACCESS,
    refreshSecret: REFRESH,
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  });

  it('inclui o jti no refresh token e devolve a data de expiração', () => {
    const pair = service.generateTokenPair({ sub: 'u1', email: 'a@a', type: 'user' }, 'sess-1');
    expect(service.verifyRefreshToken(pair.refreshToken).jti).toBe('sess-1');
    expect(pair.accessExpiresIn).toBe(900);
    expect(pair.refreshExpiresAt.getTime()).toBeGreaterThan(Date.now() + 6 * 86_400_000);
  });

  it('rejeita tokens com alg "none"', () => {
    const forged = jwt.sign({ sub: 'u1', email: 'a@a', type: 'user', permissions: ['*'] }, '', { algorithm: 'none' });
    expect(() => service.verifyAccessToken(forged)).toThrow();
  });

  it('rejeita tokens assinados com outro segredo', () => {
    const forged = jwt.sign({ sub: 'u1', email: 'a@a', type: 'user' }, 'outro-segredo-qualquer-com-32-chars!!');
    expect(() => service.verifyAccessToken(forged)).toThrow();
  });

  it('não aceita o access token como refresh (segredos diferentes)', () => {
    const pair = service.generateTokenPair({ sub: 'u1', email: 'a@a', type: 'user' }, 'sess-1');
    expect(() => service.verifyRefreshToken(pair.accessToken)).toThrow();
  });

  it('rejeita payloads com forma inválida (sem jti / type desconhecido)', () => {
    const noJti = jwt.sign({ sub: 'u1', email: 'a@a', type: 'user' }, REFRESH);
    expect(() => service.verifyRefreshToken(noJti)).toThrow();
    const badType = jwt.sign({ sub: 'u1', email: 'a@a', type: 'admin' }, ACCESS);
    expect(() => service.verifyAccessToken(badType)).toThrow();
  });

  it('gera tokens seguros de 256 bits e hash SHA-256 determinístico', () => {
    const t = service.generateSecureToken();
    expect(t).toMatch(/^[0-9a-f]{64}$/);
    expect(service.generateSecureToken()).not.toBe(t);
    expect(service.hashToken('abc')).toBe(service.hashToken('abc'));
    expect(service.hashToken('abc')).toHaveLength(64);
  });
});

describe('AesGcmSecretCipher', () => {
  const cipher = new AesGcmSecretCipher('a-chave-de-teste-com-mais-de-32-chars');

  it('cifra e decifra (round-trip) com IV aleatório', () => {
    const a = cipher.encrypt('segredo');
    const b = cipher.encrypt('segredo');
    expect(a).not.toBe(b);
    expect(cipher.decrypt(a)).toBe('segredo');
  });

  it('devolve null se o texto cifrado for adulterado ou a chave for outra', () => {
    const enc = cipher.encrypt('segredo');
    const tampered = enc.slice(0, -2) + (enc.endsWith('A') ? 'BB' : 'AA');
    expect(cipher.decrypt(tampered)).toBeNull();
    expect(new AesGcmSecretCipher('outra-chave-completamente-diferente!!').decrypt(enc)).toBeNull();
    expect(cipher.decrypt('curto')).toBeNull();
  });
});

describe('runtime config', () => {
  it('só development e test são ambientes locais; indefinido = produção', () => {
    expect(isLocalEnvironment({ NODE_ENV: 'development' })).toBe(true);
    expect(isLocalEnvironment({ NODE_ENV: 'test' })).toBe(true);
    expect(isLocalEnvironment({ NODE_ENV: 'production' })).toBe(false);
    expect(isLocalEnvironment({ NODE_ENV: 'staging' })).toBe(false);
    expect(isLocalEnvironment({})).toBe(false);
  });

  it('TRUST_PROXY: por omissão não confia em X-Forwarded-For', () => {
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy('false')).toBe(false);
    expect(parseTrustProxy('true')).toBe(true);
    expect(parseTrustProxy('2')).toBe(2);
    expect(parseTrustProxy('10.0.0.1, 10.0.0.0/8')).toEqual(['10.0.0.1', '10.0.0.0/8']);
  });

  it('remove tokens de URLs antes do log', () => {
    expect(redactUrlSecrets('/api/v1/public/upload-sessions/context?token=abc123&x=1')).toBe(
      '/api/v1/public/upload-sessions/context?token=[REDACTED]&x=1',
    );
    expect(redactUrlSecrets('/api/v1/public/upload-links/abc123/files')).toBe(
      '/api/v1/public/upload-links/[REDACTED]/files',
    );
    expect(redactUrlSecrets('/api/v1/documents?page=1')).toBe('/api/v1/documents?page=1');
  });
});

describe('contentMatchesMimeType (magic bytes)', () => {
  it.each([
    ['application/pdf', SAMPLE_FILES.pdf],
    ['image/png', SAMPLE_FILES.png],
    ['image/jpeg', SAMPLE_FILES.jpeg],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', SAMPLE_FILES.docx],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', SAMPLE_FILES.docx],
    ['application/msword', SAMPLE_FILES.doc],
    ['application/vnd.ms-excel', SAMPLE_FILES.doc],
    ['text/plain', SAMPLE_FILES.txt],
    ['text/csv', SAMPLE_FILES.csv],
  ])('aceita %s com a assinatura correta', (mime, buffer) => {
    expect(contentMatchesMimeType(buffer, mime)).toBe(true);
  });

  it.each([
    ['application/pdf', SAMPLE_FILES.exe],
    ['image/png', SAMPLE_FILES.jpeg],
    ['image/jpeg', SAMPLE_FILES.pdf],
    ['application/msword', SAMPLE_FILES.docx],
    ['text/plain', SAMPLE_FILES.exe],
    ['text/plain', SAMPLE_FILES.png],
    ['text/csv', Buffer.from([0x61, 0x00, 0x62])],
    ['application/x-msdownload', SAMPLE_FILES.exe],
  ])('rejeita %s com conteúdo incompatível', (mime, buffer) => {
    expect(contentMatchesMimeType(buffer, mime)).toBe(false);
  });
});

describe('PrismaUnitOfWork', () => {
  function fakePrisma() {
    const base = { user: { tag: 'base' }, $transaction: vi.fn() };
    const tx = { user: { tag: 'tx' } };
    base.$transaction.mockImplementation(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx));
    return { base, tx };
  }

  it('dentro de run() os repositórios usam o cliente transacional; fora, o cliente base', async () => {
    const { base } = fakePrisma();
    const db = createTransactionAwarePrisma(base as unknown as PrismaClient) as unknown as typeof base;
    const uow = new PrismaUnitOfWork(base as unknown as PrismaClient);

    expect(db.user.tag).toBe('base');
    const inside = await uow.run(async () => db.user.tag);
    expect(inside).toBe('tx');
  });

  it('run() aninhado reutiliza a transação exterior', async () => {
    const { base } = fakePrisma();
    const uow = new PrismaUnitOfWork(base as unknown as PrismaClient);
    await uow.run(() => uow.run(async () => 'ok'));
    expect(base.$transaction).toHaveBeenCalledTimes(1);
  });

  it('executa compensações (em ordem inversa) quando a transação falha', async () => {
    const { base } = fakePrisma();
    const uow = new PrismaUnitOfWork(base as unknown as PrismaClient);
    const order: string[] = [];

    await expect(
      uow.run(async () => {
        uow.onRollback(async () => void order.push('primeiro'));
        uow.onRollback(async () => void order.push('segundo'));
        throw new Error('falhou');
      }),
    ).rejects.toThrow('falhou');

    expect(order).toEqual(['segundo', 'primeiro']);
  });

  it('não corre compensações quando a transação tem sucesso', async () => {
    const { base } = fakePrisma();
    const uow = new PrismaUnitOfWork(base as unknown as PrismaClient);
    const compensation = vi.fn();
    await uow.run(async () => uow.onRollback(compensation));
    expect(compensation).not.toHaveBeenCalled();
  });

  it('uma compensação que falha não esconde o erro original', async () => {
    const { base } = fakePrisma();
    const uow = new PrismaUnitOfWork(base as unknown as PrismaClient);
    await expect(
      uow.run(async () => {
        uow.onRollback(async () => {
          throw new Error('storage down');
        });
        throw new Error('erro original');
      }),
    ).rejects.toThrow('erro original');
  });

  it('onRollback fora de run() é um erro de programação', () => {
    const { base } = fakePrisma();
    expect(() => new PrismaUnitOfWork(base as unknown as PrismaClient).onRollback(async () => {})).toThrow();
  });
});
