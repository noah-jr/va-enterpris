import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { PaginatedResponse, AuditLogDTO, AuditAction } from '@accountable/types';
import type { AuditFilterInput } from '@accountable/schemas';

export class ListAuditLogsUseCase {
  constructor(private readonly auditRepository: IAuditRepository) {}

  async execute(params: AuditFilterInput): Promise<PaginatedResponse<AuditLogDTO>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 50;

    const from = params.from ? new Date(params.from) : undefined;
    const to = params.to ? new Date(params.to) : undefined;

    const { items, total } = await this.auditRepository.list({
      page,
      perPage,
      action: params.action,
      userId: params.userId,
      clientId: params.clientId,
      entity: params.entity,
      from,
      to,
    });

    const data: AuditLogDTO[] = items.map((l) => ({
      id: l.id,
      userId: l.userId,
      clientId: l.clientId,
      action: l.action as AuditAction,
      entity: l.entity,
      entityId: l.entityId,
      oldValues: l.oldValues,
      newValues: l.newValues,
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    }));

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
