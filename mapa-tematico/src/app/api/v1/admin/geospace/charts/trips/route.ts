import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'day';

    let labels: string[] = [];
    let data: number[] = [];

    if (period === 'day') {
        labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        data = Array.from({ length: 24 }, () => Math.floor(Math.random() * 200) + 50);
    } else if (period === 'week') {
        labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        data = Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 300);
    } else {
        // month
        labels = Array.from({ length: 30 }, (_, i) => `Dia ${i + 1}`);
        data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3000) + 1000);
    }

    const colors = {
        day: '#10b981', // Emerald
        week: '#6366f1', // Indigo
        month: '#8b5cf6' // Violet
    };

    const color = colors[period as keyof typeof colors];

    return NextResponse.json({
        status: 'success',
        data: {
            labels,
            datasets: [
                {
                    label: 'Viagens Efetuadas',
                    data,
                    backgroundColor: `${color}33`,
                    borderColor: color,
                }
            ]
        }
    });
}
