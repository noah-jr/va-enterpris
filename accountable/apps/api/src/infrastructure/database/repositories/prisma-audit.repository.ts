import { type PrismaClient, Prisma } from '@prisma/client';
import type {
  CreateAuditLogData,
  IAuditRepository,
} from '../../../domain/repositories/user.repository.interface.js';

export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async log(data: CreateAuditLogData): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        clientId: data.clientId ?? null,
        action: data.action,
        entity: data.entity ?? null,
        entityId: data.entityId ?? null,
        oldValues: (data.oldValues as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        newValues: (data.newValues as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async list(params: {
    page: number;
    perPage: number;
    action?: string;
    userId?: string;
    clientId?: string;
    entity?: string;
    from?: Date;
    to?: Date;
  }): Promise<{
    items: Array<{
      id: string;
      userId: string | null;
      clientId: string | null;
      action: string;
      entity: string | null;
      entityId: string | null;
      oldValues: Record<string, unknown> | null;
      newValues: Record<string, unknown> | null;
      ipAddress: string | null;
      userAgent: string | null;
      metadata: Record<string, unknown> | null;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const { page, perPage, action, userId, clientId, entity, from, to } = params;
    const skip = (page - 1) * perPage;

    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
      ...(clientId ? { clientId } : {}),
      ...(entity ? { entity } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [rawLogs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const items = rawLogs.map((log) => ({
      id: log.id,
      userId: log.userId,
      clientId: log.clientId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      oldValues: log.oldValues as unknown as Record<string, unknown> | null,
      newValues: log.newValues as unknown as Record<string, unknown> | null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata as unknown as Record<string, unknown> | null,
      createdAt: log.createdAt,
    }));

    return { items, total };
  }
}
