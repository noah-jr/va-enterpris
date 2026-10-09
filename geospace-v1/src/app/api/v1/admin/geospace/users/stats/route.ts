import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const total = await prisma.user.count();
        const agents = await prisma.user.count({ where: { role: 'AGENTE_CAMPO' } });
        const admins = await prisma.user.count({ where: { role: 'ADMIN_REGIONAL' } });
        const operators = await prisma.user.count({ where: { role: 'OPERADOR_CENTRAL' } });
        const coordinators = await prisma.user.count({ where: { role: 'COORDENADOR_EMPRESA' } });
        const superAdmins = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });

        return NextResponse.json({
            statusCode: 200,
            object: {
                total,
                active: total, // For now assuming all are active in this tier
                suspended: 0,
                banned: 0,
                byRole: {
                    SUPER_ADMIN: superAdmins,
                    ADMIN_REGIONAL: admins,
                    OPERADOR_CENTRAL: operators,
                    COORDENADOR_EMPRESA: coordinators,
                    AGENTE_CAMPO: agents
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
