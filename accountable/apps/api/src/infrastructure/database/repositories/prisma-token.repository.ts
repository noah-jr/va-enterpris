import type { PrismaClient } from '@prisma/client';
import type {
  EmailTokenKind,
  EmailTokenRecord,
  ITokenRepository,
} from '../../../domain/repositories/user.repository.interface.js';

interface RawTokenRow {
  id: string;
  clientId?: string;
  userId?: string;
  expiresAt: Date;
  usedAt: Date | null;
  otpHash: string | null;
  otpAttempts: number;
}

/**
 * As três tabelas têm a mesma forma (id, tokenHash, otpHash, otpAttempts, expiresAt, usedAt)
 * e só diferem no dono (clientId/userId). Este delegate uniformiza o acesso.
 */
interface TokenDelegate {
  create(args: { data: Record<string, unknown> }): Promise<RawTokenRow>;
  findUnique(args: { where: { tokenHash: string } }): Promise<RawTokenRow | null>;
  findFirst(args: { where: Record<string, unknown>; orderBy: { createdAt: 'desc' } }): Promise<RawTokenRow | null>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<RawTokenRow>;
  updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
}

const OWNER_FIELD: Record<EmailTokenKind, 'clientId' | 'userId'> = {
  EMAIL_VERIFICATION: 'clientId',
  CLIENT_PASSWORD_RESET: 'clientId',
  USER_PASSWORD_RESET: 'userId',
};

export class PrismaTokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private delegate(kind: EmailTokenKind): TokenDelegate {
    switch (kind) {
      case 'EMAIL_VERIFICATION':
        return this.prisma.emailVerificationToken as unknown as TokenDelegate;
      case 'CLIENT_PASSWORD_RESET':
        return this.prisma.clientPasswordResetToken as unknown as TokenDelegate;
      case 'USER_PASSWORD_RESET':
        return this.prisma.userPasswordResetToken as unknown as TokenDelegate;
    }
  }

  private toRecord(kind: EmailTokenKind, row: RawTokenRow): EmailTokenRecord {
    return {
      id: row.id,
      ownerId: (OWNER_FIELD[kind] === 'clientId' ? row.clientId : row.userId) ?? '',
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      otpHash: row.otpHash,
      otpAttempts: row.otpAttempts,
    };
  }

  async create(
    kind: EmailTokenKind,
    data: { ownerId: string; tokenHash: string; otpHash: string | null; expiresAt: Date },
  ): Promise<EmailTokenRecord> {
    const row = await this.delegate(kind).create({
      data: {
        [OWNER_FIELD[kind]]: data.ownerId,
        tokenHash: data.tokenHash,
        otpHash: data.otpHash,
        expiresAt: data.expiresAt,
      },
    });
    return this.toRecord(kind, row);
  }

  async findByTokenHash(kind: EmailTokenKind, tokenHash: string): Promise<EmailTokenRecord | null> {
    const row = await this.delegate(kind).findUnique({ where: { tokenHash } });
    return row ? this.toRecord(kind, row) : null;
  }

  async findLatestActive(kind: EmailTokenKind, ownerId: string): Promise<EmailTokenRecord | null> {
    const row = await this.delegate(kind).findFirst({
      where: { [OWNER_FIELD[kind]]: ownerId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.toRecord(kind, row) : null;
  }

  async incrementOtpAttempts(kind: EmailTokenKind, id: string): Promise<void> {
    await this.delegate(kind).update({ where: { id }, data: { otpAttempts: { increment: 1 } } });
  }

  async markUsed(kind: EmailTokenKind, id: string): Promise<boolean> {
    const result = await this.delegate(kind).updateMany({
      where: { id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return result.count === 1;
  }

  async replaceTokenHash(kind: EmailTokenKind, id: string, tokenHash: string): Promise<void> {
    await this.delegate(kind).update({ where: { id }, data: { tokenHash } });
  }

  async invalidateActive(kind: EmailTokenKind, ownerId: string): Promise<void> {
    await this.delegate(kind).updateMany({
      where: { [OWNER_FIELD[kind]]: ownerId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}
