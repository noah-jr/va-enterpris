import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const total = await prisma.auditLog.count();
        
        // Group by action
        const actions = await prisma.auditLog.groupBy({
            by: ['action'],
            _count: true
        });

        // Group by resource
        const resources = await prisma.auditLog.groupBy({
            by: ['resource'],
            _count: true
        });

        const byAction = actions.reduce((acc: any, curr) => {
            acc[curr.action] = curr._count;
            return acc;
        }, {});

        const byResource = resources.reduce((acc: any, curr) => {
            acc[curr.resource] = curr._count;
            return acc;
        }, {});

        return NextResponse.json({
            statusCode: 200,
            object: {
                total,
                byAction,
                byResource,
                byUser: {} // Add user grouping if needed
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
