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
            csvContent = "ID,Código,Título,Status,Prioridade,Província,Data\n";
            data.forEach(item => {
                csvContent += `${item.id},${item.code},"${item.title.replace(/"/g, '""')}",${item.status},${item.priority},${item.province || 'N/A'},${item.createdAt.toISOString()}\n`;
            });
        } else if (type === 'schools') {
            const data = await prisma.school.findMany();
            csvContent = "ID,Nome,Código,Nível,Alunos,Professores,Província\n";
            data.forEach(item => {
                csvContent += `${item.id},"${item.name.replace(/"/g, '""')}",${item.code},${item.level},${item.studentsCount},${item.teachersCount},${item.province}\n`;
            });
        } else if (type === 'hospitals') {
            const data = await prisma.hospital.findMany();
            csvContent = "ID,Nome,Código,Tipo,Capacidade,Pacientes,Província\n";
            data.forEach(item => {
                csvContent += `${item.id},"${item.name.replace(/"/g, '""')}",${item.code},${item.type},${item.bedCapacity},${item.currentPatients},${item.province}\n`;
            });
        } else if (type === 'demographics') {
            const data = await prisma.demographicData.findMany();
            csvContent = "ID,Região,Tipo,População,Densidade,Crescimento%\n";
            data.forEach(item => {
                csvContent += `${item.id},"${item.regionName.replace(/"/g, '""')}",${item.regionType},${item.totalPopulation},${item.density},${item.growthRate}\n`;
            });
        } else if (type === 'database') {
            const data = await prisma.auditLog.findMany({ take: 100 });
            csvContent = "DATABASE_DUMP_V1,SYNC_MTNI_2026\n";
            csvContent += "ID,Ação,Recurso,Data,Detalhes\n";
            data.forEach(item => {
                csvContent += `${item.id},${item.action},${item.resource},${item.createdAt.toISOString()},"${(item.details || '').replace(/"/g, '""')}"\n`;
            });
        } else {
            const data = await prisma.auditLog.findMany();
            csvContent = "ID,Ação,Recurso,Usuário,Data\n";
            data.forEach(item => {
                csvContent += `${item.id},${item.action},${item.resource},${item.userName || 'System'},${item.createdAt.toISOString()}\n`;
            });
        }

        const format = searchParams.get('format') || 'csv';
        const contentType = format === 'sql' ? 'application/sql' : 'text/csv';
        const fileName = `mtni_${type}_export.${format}`;

        return new Response(csvContent, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
