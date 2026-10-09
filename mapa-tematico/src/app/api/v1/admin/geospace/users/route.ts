import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const where: any = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                lat: true,
                lng: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Error listing users:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, lat, lng } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                status: 'ACTIVE',
                lat: lat != null ? parseFloat(lat) : -12.1642,
                lng: lng != null ? parseFloat(lng) : 17.5691
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                lat: true,
                lng: true,
                createdAt: true
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
