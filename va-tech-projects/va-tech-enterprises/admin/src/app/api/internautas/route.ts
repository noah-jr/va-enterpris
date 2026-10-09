import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação
const internautaSchema = z.object({
    firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    occupation: z.string().optional(),
    company: z.string().optional(),
    interests: z.string().optional(),
    howDidYouHear: z.string().optional(),
    newsletter: z.boolean().optional(),
    termsAccepted: z.boolean(),
    status: z.string().optional(),
    notes: z.string().optional(),
});

// GET - Listar todos os internautas
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { city: { contains: search } },
                { company: { contains: search } },
            ];
        }

        const [internautas, total] = await Promise.all([
            prisma.internauta.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.internauta.count({ where }),
        ]);

        return NextResponse.json({
            internautas,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Erro ao buscar internautas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar internautas' },
            { status: 500 }
        );
    }
}

// POST - Criar novo internauta
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar dados
        const validatedData = internautaSchema.parse(body);

        // Converter birthDate se fornecido
        const data: any = { ...validatedData };
        if (data.birthDate) {
            data.birthDate = new Date(data.birthDate);
        }

        // Verificar se email já existe
        const existingInternauta = await prisma.internauta.findUnique({
            where: { email: data.email },
        });

        if (existingInternauta) {
            return NextResponse.json(
                { error: 'Email já cadastrado' },
                { status: 400 }
            );
        }

        // Criar internauta
        const internauta = await prisma.internauta.create({
            data,
        });

        return NextResponse.json(internauta, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: (error as any).errors || error.issues },
                { status: 400 }
            );
        }

        console.error('Erro ao criar internauta:', error);
        return NextResponse.json(
            { error: 'Erro ao criar internauta' },
            { status: 500 }
        );
    }
}
