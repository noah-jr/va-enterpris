import { NextRequest, NextResponse } from 'next/server';
import { ProjectUseCases } from '@/application/use-cases/project.use-cases';
import { projectRepository } from '@/infrastructure/repositories';

const projectUseCases = new ProjectUseCases(projectRepository);

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const project = await projectUseCases.getProjectById(id);

        if (!project) {
            return NextResponse.json(
                { error: 'Projecto não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error: unknown) {
        console.error('Get project error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter projecto' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: { title?: string; description?: string; images?: string[]; status?: string; completedAt?: Date } = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [];
        if (body.status !== undefined) updateData.status = body.status;
        if (body.completedAt !== undefined) updateData.completedAt = body.completedAt ? new Date(body.completedAt) : undefined;

        const project = await projectUseCases.updateProject(id, updateData);
        return NextResponse.json(project);
    } catch (error: unknown) {
        console.error('Update project error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao atualizar projecto' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await projectUseCases.deleteProject(id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete project error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao eliminar projecto' },
            { status: 500 }
        );
    }
}
