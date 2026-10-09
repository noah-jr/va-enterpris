import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Tráfego (Depreciado no MTNI)',
        statusCode: 200,
        object: []
    });
}
