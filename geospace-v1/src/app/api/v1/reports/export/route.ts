import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'incidents';

        let csvContent = "";

        if (type === 'incidents') {
            const data = await prisma.incident.findMany();
            csvContent = "ID,Título,Status,Prioridade,Data\n";
            data.forEach(item => {
                csvContent += `${item.id},"${item.title.replace(/"/g, '""')}",${item.status},${item.priority},${item.createdAt.toISOString()}\n`;
            });
        } else if (type === 'units') {
            const data = await prisma.unit.findMany();
            csvContent = "ID,Código,Status,Agentes\n";
            data.forEach(item => {
                csvContent += `${item.id},${item.code},${item.status},${item.agentsCount}\n`;
            });
        } else {
            const data = await prisma.auditLog.findMany();
            csvContent = "ID,Ação,Recurso,Usuário,Data\n";
            data.forEach(item => {
                csvContent += `${item.id},${item.action},${item.resource},${item.userName || 'System'},${item.createdAt.toISOString()}\n`;
            });
        }

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="geospace_${type}_export.csv"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
