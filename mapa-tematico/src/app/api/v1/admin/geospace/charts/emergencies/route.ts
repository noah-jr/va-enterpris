import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'day';

    let labels: string[] = [];
    let data: number[] = [];

    // Mocking data based on period
    if (period === 'day') {
        labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        data = Array.from({ length: 24 }, () => Math.floor(Math.random() * 50) + 10);
    } else if (period === 'week') {
        labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        data = Array.from({ length: 7 }, () => Math.floor(Math.random() * 300) + 100);
    } else {
        // month
        labels = Array.from({ length: 30 }, (_, i) => `Dia ${i + 1}`);
        data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 50);
    }

    // Dynamic color depending on period to allow visual alternation
    const colors = {
        day: '#ef4444', // Red
        week: '#f59e0b', // Amber
        month: '#3b82f6' // Blue
    };

    const color = colors[period as keyof typeof colors];

    return NextResponse.json({
        status: 'success',
        data: {
            labels,
            datasets: [
                {
                    label: 'Alertas SOS',
                    data,
                    backgroundColor: `${color}33`, // 20% opacity HEX
                    borderColor: color,
                }
            ]
        }
    });
}
