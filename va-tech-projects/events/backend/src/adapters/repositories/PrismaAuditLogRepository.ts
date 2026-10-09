import { IAuditLogRepository } from '../../core/repositories/IAuditLogRepository';
import { prisma } from '../../infrastructure/database/prisma';

export class PrismaAuditLogRepository implements IAuditLogRepository {
    async create(data: any): Promise<void> {
        await prisma.auditLog.create({
            data,
        });
    }
}
