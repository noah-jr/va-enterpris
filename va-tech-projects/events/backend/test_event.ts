import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';
dotenv.config();

const url = new URL(process.env.DATABASE_URL as string);
const poolConfig = {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    connectionLimit: 1,
};

const adapter = new PrismaMariaDb(poolConfig as any);
const prisma = new PrismaClient({ adapter } as any);

async function test() {
    try {
        const e = await prisma.event.create({
            data: {
                titulo: 'Test with Tickets',
                descricao: 'Test',
                data: new Date(),
                local: 'Test',
                vagas: 10,
                status: 'PENDENTE',
                tickets: {
                    create: [
                        { tipo: 'Geral', preco: 1000, quantidade: 5 }
                    ]
                }
            }
        });
        console.log('Success:', e);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await (prisma as any).$disconnect();
    }
}

test();
