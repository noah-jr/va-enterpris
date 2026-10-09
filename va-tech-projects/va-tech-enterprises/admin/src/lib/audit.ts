import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAudit({
    action,
    entity,
    entityId,
    details,
    userId,
    ipAddress
}: {
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    userId?: string;
    ipAddress?: string;
}) {
    try {
        // Try to get IP from headers if not provided
        let clientIp = ipAddress;
        if (!clientIp) {
            try {
                const headerList = await headers();
                clientIp = headerList.get("x-forwarded-for") || undefined;
                if (clientIp?.includes(",")) {
                    clientIp = clientIp.split(",")[0].trim();
                }
            } catch (e) {
                // Not in a request context
            }
        }

        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : undefined,
                userId,
                ipAddress: clientIp
            }
        });
    } catch (error) {
        console.error("Failed to write audit log", error);
    }
}
