import prisma from '../lib/prisma';


export class AuditService {
    static async log(params: {
        companyId: string;
        userId?: string;
        action: string;
        entity: string;
        entityId: string;
        details?: string;
        ipAddress?: string;
    }) {
        try {
            await (prisma.auditLog as any).create({
                data: {
                    companyId: params.companyId,
                    userId: params.userId,
                    action: params.action,
                    entity: params.entity,
                    entityId: params.entityId,
                    details: params.details,
                    ipAddress: params.ipAddress
                }
            });
        } catch (error) {
            console.error('[Audit Log Error]', error);
        }
    }
}
