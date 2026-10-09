import { NextResponse } from 'next/server';

export async function GET() {
    // Usually these are days of the week, or simple trends
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const data = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 150);

    return NextResponse.json({
        status: 'success',
        data: {
            labels,
            datasets: [
                {
                    label: 'Motoristas Online',
                    data,
                    backgroundColor: '#14b8a633', // Teal 500
                    borderColor: '#14b8a6',
                }
            ]
        }
    });
}
