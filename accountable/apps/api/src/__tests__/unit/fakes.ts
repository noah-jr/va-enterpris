import { vi } from 'vitest';
import { createHash } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import type {
  IEmailService,
  IFileStorage,
  ISecretCipher,
  ITokenService,
  IUnitOfWork,
} from '../../application/contracts/index.js';
import type {
  ClientEntity,
  EmailTokenKind,
  EmailTokenRecord,
  IAuditRepository,
  IClientRepository,
  ITokenRepository,
  IUserRepository,
  UserWithRolesEntity,
} from '../../domain/repositories/index.js';
import { HmacOtpService } from '../../infrastructure/auth/hmac-otp.service.js';
import { EmailTokenService } from '../../application/services/email-token.service.js';

/**
 * Unit of work em memória: executa o trabalho diretamente e, se falhar,
 * corre as compensações registadas — o mesmo contrato da implementação Prisma.
 */
export class FakeUnitOfWork implements IUnitOfWork {
  runs = 0;
  rollbacks = 0;
  private compensations: Array<() => Promise<void>> | null = null;

  async run<T>(work: () => Promise<T>): Promise<T> {
    if (this.compensations) return work();
    this.runs++;
    this.compensations = [];
    const compensations = this.compensations;
    try {
      return await work();
    } catch (error) {
      this.rollbacks++;
      for (const compensate of compensations.reverse()) await compensate();
      throw error;
    } finally {
      this.compensations = null;
    }
  }

  onRollback(compensation: () => Promise<void>): void {
    if (!this.compensations) throw new Error('onRollback fora de run()');
    this.compensations.push(compensation);
  }
}

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export function createTokenServiceMock(overrides: Partial<ITokenService> = {}): ITokenService {
  return {
    generateTokenPair: vi.fn(),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    generateSecureToken: vi.fn().mockReturnValue('a'.repeat(64)),
    hashToken: vi.fn((token: string) => sha256(token)),
    ...overrides,
  };
}

/** Cifra reversível trivial para testes (NÃO é segura). */
export const fakeCipher: ISecretCipher = {
  encrypt: (plain) => `enc:${plain}`,
  decrypt: (value) => (value.startsWith('enc:') ? value.slice(4) : null),
};

export function createClientRepositoryMock(): IClientRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByNip: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setInitialPassword: vi.fn().mockResolvedValue(true),
    softDelete: vi.fn(),
    list: vi.fn(),
  };
}

export function createAuditRepositoryMock(): IAuditRepository {
  return {
    log: vi.fn().mockResolvedValue(undefined),
    list: vi.fn(),
  };
}

export function createFileStorageMock(): IFileStorage {
  return {
    upload: vi.fn().mockResolvedValue({ storagePath: 'bucket/path', etag: 'etag' }),
    getSignedUrl: vi.fn().mockResolvedValue('https://signed.example/file'),
    delete: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(true),
    ensureBucketExists: vi.fn().mockResolvedValue(undefined),
    getObject: vi.fn().mockResolvedValue(Buffer.from('')),
  };
}

export function buildClient(overrides: Partial<ClientEntity> = {}): ClientEntity {
  const now = new Date('2026-09-01T10:00:00Z');
  return {
    id: 'client-1',
    nip: '5000000000',
    name: 'Cliente Teste',
    email: 'cliente@teste.ao',
    phone: null,
    company: 'Empresa Teste Lda',
    department: null,
    isActive: true,
    emailVerified: true,
    passwordHash: '$2a$12$hash',
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

/** Buffers com assinaturas binárias reais para testar a validação de conteúdo. */
export const SAMPLE_FILES = {
  pdf: Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.from('conteudo de teste')]),
  png: Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]),
  jpeg: Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(16)]),
  docx: Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(16)]),
  doc: Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(16)]),
  txt: Buffer.from('linha 1\nlinha 2\n'),
  csv: Buffer.from('nif;valor\n500;1000\n'),
  exe: Buffer.concat([Buffer.from('MZ'), Buffer.alloc(16)]),
};

export function createEmailServiceMock(): IEmailService {
  return {
    send: vi.fn().mockResolvedValue(undefined),
    sendEmailVerification: vi.fn().mockResolvedValue(undefined),
    sendPasswordReset: vi.fn().mockResolvedValue(undefined),
    sendUserInvitation: vi.fn().mockResolvedValue(undefined),
    sendTestEmail: vi.fn().mockResolvedValue(undefined),
    sendDocumentStatusChanged: vi.fn().mockResolvedValue(undefined),
    sendDocumentRequest: vi.fn().mockResolvedValue(undefined),
  };
}

export function createUserRepositoryMock(): IUserRepository {
  return {
    findById: vi.fn(),
    findByIdWithRoles: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setRoles: vi.fn().mockResolvedValue(undefined),
    softDelete: vi.fn(),
    list: vi.fn(),
    countActiveWithPermission: vi.fn().mockResolvedValue(1),
  };
}

export function buildUserWithRoles(
  overrides: Partial<UserWithRolesEntity> = {},
  permissions: string[] = ['documents:read'],
  roleName = 'CONSULTANT',
): UserWithRolesEntity {
  return {
    id: 'user-1',
    email: 'consultor@va.ao',
    name: 'Consultor',
    passwordHash: 'hash',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    roles: [
      { role: { id: `role-${roleName}`, name: roleName, permissions: permissions.map((name) => ({ permission: { name } })) } },
    ],
    ...overrides,
  };
}

/** Repositório de tokens em memória com a mesma semântica do Prisma (incl. markUsed atómico). */
export class InMemoryTokenRepository implements ITokenRepository {
  rows: Array<EmailTokenRecord & { kind: EmailTokenKind; tokenHash: string; createdAt: number }> = [];
  private seq = 0;

  async create(kind: EmailTokenKind, data: { ownerId: string; tokenHash: string; otpHash: string | null; expiresAt: Date }) {
    const row = { id: randomUUID(), kind, ...data, usedAt: null, otpAttempts: 0, createdAt: this.seq++ };
    this.rows.push(row);
    return { ...row };
  }
  async findByTokenHash(kind: EmailTokenKind, tokenHash: string) {
    const row = this.rows.find((r) => r.kind === kind && r.tokenHash === tokenHash);
    return row ? { ...row } : null;
  }
  async findLatestActive(kind: EmailTokenKind, ownerId: string) {
    const row = this.rows
      .filter((r) => r.kind === kind && r.ownerId === ownerId && !r.usedAt && r.expiresAt.getTime() > Date.now())
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    return row ? { ...row } : null;
  }
  async incrementOtpAttempts(_kind: EmailTokenKind, id: string) {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.otpAttempts++;
  }
  async markUsed(_kind: EmailTokenKind, id: string) {
    const row = this.rows.find((r) => r.id === id);
    if (!row || row.usedAt) return false;
    row.usedAt = new Date();
    return true;
  }
  async replaceTokenHash(_kind: EmailTokenKind, id: string, tokenHash: string) {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.tokenHash = tokenHash;
  }
  async invalidateActive(kind: EmailTokenKind, ownerId: string) {
    for (const r of this.rows) if (r.kind === kind && r.ownerId === ownerId && !r.usedAt) r.usedAt = new Date();
  }
}

export const TEST_OTP_SECRET = 'test-otp-secret-with-at-least-32-characters';

/** EmailTokenService real sobre o repositório em memória. */
export function createEmailTokens(tokens: ITokenRepository = new InMemoryTokenRepository()) {
  const otp = new HmacOtpService(TEST_OTP_SECRET);
  let counter = 0;
  const tokenService = createTokenServiceMock({
    generateSecureToken: vi.fn(() => (counter++).toString(16).padStart(64, 'a')),
  });
  return { emailTokens: new EmailTokenService(tokens, tokenService, otp), tokens, tokenService, otp };
}
