import { NextRequest, NextResponse } from 'next/server';

export interface Emergency {
    id: string;
    type: 'SOS' | 'ACCIDENT' | 'MEDICAL' | 'FIRE' | 'OTHER';
    status: 'PENDING' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_ALARM';
    description?: string;
    latitude: number;
    longitude: number;
    address?: string;
    reporter: {
        id: string;
        name: string;
        phone: string;
    };
    responder?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Mock data - substitua com chamadas reais ao banco de dados
const MOCK_EMERGENCIES: Emergency[] = [
    {
        id: 'emer_1',
        type: 'SOS',
        status: 'PENDING',
        description: 'Passageiro reportou comportamento suspeito',
        latitude: -8.8383,
        longitude: 13.2344,
        address: 'Av. Deolinda Rodrigues, Luanda',
        reporter: { id: 'u1', name: 'Ana Costa', phone: '+244 923 456 789' },
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: 'emer_2',
        type: 'ACCIDENT',
        status: 'IN_PROGRESS',
        description: 'Colisão entre dois veículos',
        latitude: -8.8420,
        longitude: 13.2450,
        address: 'Rua Rainha Ginga',
        reporter: { id: 'd2', name: 'Carlos Sousa', phone: '+244 912 345 678' },
        responder: { id: 'op1', name: 'Operador GEOSPACE 1' },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
        id: 'emer_3',
        type: 'MEDICAL',
        status: 'RESOLVED',
        description: 'Passageiro sentindo-se mal',
        latitude: -8.8100,
        longitude: 13.2200,
        address: 'Ilha de Luanda',
        reporter: { id: 'd5', name: 'Pedro Miguel', phone: '+244 933 111 222' },
        responder: { id: 'op2', name: 'Operador GEOSPACE 2' },
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
        id: 'emer_4',
        type: 'FIRE',
        status: 'ACKNOWLEDGED',
        description: 'Incêndio em edifício comercial',
        latitude: -8.8150,
        longitude: 13.2300,
        address: 'Rua da Missão, Luanda',
        reporter: { id: 'u4', name: 'João Silva', phone: '+244 944 555 666' },
        responder: { id: 'op3', name: 'Operador GEOSPACE 3' },
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
        id: 'emer_5',
        type: 'OTHER',
        status: 'PENDING',
        description: 'Solicitação de assistência geral',
        latitude: -8.8250,
        longitude: 13.2380,
        address: 'Bairro Maculusso',
        reporter: { id: 'u5', name: 'Maria Santos', phone: '+244 955 777 888' },
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
];

export async function GET(request: NextRequest) {
    try {
        // Aqui você pode adicionar filtros baseados em query params
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        let filteredEmergencies = [...MOCK_EMERGENCIES];

        if (status) {
            filteredEmergencies = filteredEmergencies.filter(
                (e) => e.status === status
            );
        }

        if (type) {
            filteredEmergencies = filteredEmergencies.filter(
                (e) => e.type === type
            );
        }

        return NextResponse.json(filteredEmergencies);
    } catch (error) {
        console.error('Error fetching emergencies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch emergencies' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validação básica
        if (!body.type || !body.latitude || !body.longitude) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Criar nova emergência
        const newEmergency: Emergency = {
            id: `emer_${Date.now()}`,
            type: body.type,
            status: 'PENDING',
            description: body.description,
            latitude: body.latitude,
            longitude: body.longitude,
            address: body.address,
            reporter: body.reporter,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Aqui você salvaria no banco de dados
        MOCK_EMERGENCIES.push(newEmergency);

        return NextResponse.json(newEmergency, { status: 201 });
    } catch (error) {
        console.error('Error creating emergency:', error);
        return NextResponse.json(
            { error: 'Failed to create emergency' },
            { status: 500 }
        );
    }
}
