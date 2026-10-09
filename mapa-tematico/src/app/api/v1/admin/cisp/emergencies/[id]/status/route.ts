import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Validação
        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const validStatuses = ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Aqui você atualizaria no banco de dados
        // Por enquanto, apenas simulamos a atualização
        console.log(`Emergency ${id} status updated to ${status}`);

        return NextResponse.json({
            id,
            status,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating emergency status:', error);
        return NextResponse.json(
            { error: 'Failed to update emergency status' },
            { status: 500 }
        );
    }
}
