import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Mock data - substitua com chamadas reais ao banco de dados
        const stats = {
            totalEmergencies: 1247,
            activeEmergencies: 23,
            responseTime: 4.2, // minutos
            resolvedToday: 89,
            emergenciesByType: [
                { type: 'Incêndio', count: 342, percentage: 27.4 },
                { type: 'Acidente', count: 298, percentage: 23.9 },
                { type: 'Assalto', count: 267, percentage: 21.4 },
                { type: 'Emergência Médica', count: 198, percentage: 15.9 },
                { type: 'Outros', count: 142, percentage: 11.4 },
            ],
            emergenciesByStatus: [
                { status: 'Pendente', count: 23, percentage: 1.8 },
                { status: 'Em Atendimento', count: 45, percentage: 3.6 },
                { status: 'Resolvida', count: 1089, percentage: 87.3 },
                { status: 'Cancelada', count: 90, percentage: 7.2 },
            ],
            recentActivity: [
                {
                    id: 1,
                    type: 'Incêndio',
                    location: 'Rua da Missão, Luanda',
                    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
                    status: 'Em Atendimento',
                },
                {
                    id: 2,
                    type: 'Acidente',
                    location: 'Av. 4 de Fevereiro',
                    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
                    status: 'Pendente',
                },
                {
                    id: 3,
                    type: 'Emergência Médica',
                    location: 'Bairro Maculusso',
                    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
                    status: 'Resolvida',
                },
            ],
            responseTimeByHour: Array.from({ length: 24 }, (_, i) => ({
                hour: i,
                avgResponseTime: Math.random() * 10 + 2, // 2-12 minutos
                emergencyCount: Math.floor(Math.random() * 50),
            })),
            emergenciesByDistrict: [
                { district: 'Luanda', count: 456, percentage: 36.6 },
                { district: 'Viana', count: 234, percentage: 18.8 },
                { district: 'Talatona', count: 198, percentage: 15.9 },
                { district: 'Cacuaco', count: 167, percentage: 13.4 },
                { district: 'Outros', count: 192, percentage: 15.4 },
            ],
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
