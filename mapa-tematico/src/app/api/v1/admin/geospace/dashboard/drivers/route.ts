import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'success',
        object: [
            { id: 'd1', name: 'João Manuel', status: 'ONLINE', location: 'Luanda Sul' },
            { id: 'd2', name: 'António Kiala', status: 'ONLINE', location: 'Talatona' },
            { id: 'd3', name: 'Silvio Cassoma', status: 'ONLINE', location: 'Viana' },
            { id: 'd4', name: 'Ana Nzinga', status: 'ONLINE', location: 'Benfica' }
        ]
    });
}
