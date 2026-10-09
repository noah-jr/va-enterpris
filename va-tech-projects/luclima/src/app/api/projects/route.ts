import { NextRequest, NextResponse } from 'next/server';
import { ProjectUseCases } from '@/application/use-cases/project.use-cases';
import { projectRepository } from '@/infrastructure/repositories';

const projectUseCases = new ProjectUseCases(projectRepository);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sectorId = searchParams.get('sectorId');
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');

        const filters: { sectorId?: string; status?: string; userId?: string } = {};
        if (sectorId) filters.sectorId = sectorId;
        if (status) filters.status = status;
        if (userId) filters.userId = userId;

        const projects = await projectUseCases.getAllProjects(filters);
        return NextResponse.json({ projects }, { status: 200 });
    } catch (error: unknown) {
        console.error('Get projects error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter projectos' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, images, sectorId, userId, status } = body;

        if (!title || !sectorId || !userId) {
            return NextResponse.json(
                { error: 'Título, sector e responsável são obrigatórios' },
                { status: 400 }
            );
        }

        const project = await projectUseCases.createProject({
            title,
            description: description ?? '',
            images: Array.isArray(images) ? images : [],
            sectorId,
            userId,
            status: status ?? 'ACTIVE',
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error: unknown) {
        console.error('Create project error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao criar projecto' },
            { status: 500 }
        );
    }
}
