import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'geospace-military-grade-secret-2026';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { currentPassword, newPassword } = await req.json();

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return NextResponse.json({ message: 'Usuário não existe' }, { status: 404 });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return NextResponse.json({ message: 'Senha atual incorreta' }, { status: 400 });

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed }
        });

        return NextResponse.json({ message: 'Senha alterada com sucesso', statusCode: 200, object: { success: true } });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
