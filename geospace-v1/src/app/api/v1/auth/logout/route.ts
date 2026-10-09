import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // Para simplificar, o logout apenas limpa o estado no cliente
    // Aqui poderíamos invalidar a sessão se estivéssemos usando Redis/sessão servidora
    return NextResponse.json({
        message: 'Logout realizado com sucesso. Até logo!',
        statusCode: 200,
        object: null
    });
}
