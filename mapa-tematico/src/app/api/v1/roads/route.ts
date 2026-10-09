import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Malha rodoviária (Depreciado no MTNI)',
        statusCode: 200,
        object: []
    });
}
