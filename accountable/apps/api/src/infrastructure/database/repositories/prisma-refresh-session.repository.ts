import type { PrismaClient } from '@prisma/client';
import type {
  CreateRefreshSessionData,
  IRefreshSessionRepository,
  RefreshSessionEntity,
  SessionSubjectType,
} from '../../../domain/repositories/refresh-session.repository.interface.js';

const SELECT = {
  id: true,
  familyId: true,
  subjectType: true,
  subjectId: true,
  expiresAt: true,
  revokedAt: true,
  replacedById: true,
  createdAt: true,
} as const;

export class PrismaRefreshSessionRepository implements IRefreshSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRefreshSessionData): Promise<RefreshSessionEntity> {
    return this.prisma.refreshSession.create({
      data: {
        id: data.id,
        familyId: data.familyId,
        subjectType: data.subjectType,
        subjectId: data.subjectId,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
      select: SELECT,
    });
  }

  async findById(id: string): Promise<RefreshSessionEntity | null> {
    return this.prisma.refreshSession.findUnique({ where: { id }, select: SELECT });
  }

  async revokeIfActive(id: string, replacedById?: string): Promise<boolean> {
    const result = await this.prisma.refreshSession.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date(), replacedById: replacedById ?? null },
    });
    return result.count === 1;
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForSubject(subjectType: SessionSubjectType, subjectId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { subjectType, subjectId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
