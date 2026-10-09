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

async function main() {
    console.log('🌱 Start');
    try {
        await prisma.event.create({
            data: {
                titulo: 'Show do Bonga - 50 Anos de Carreira',
                descricao: 'Uma noite histórica',
                data: new Date('2024-12-25T20:00:00Z'),
                local: 'Baía de Luanda',
                vagas: 1000,
                image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80',
                preco_min: 15000,
                status: 'PUBLICADO',
                tickets: {
                    create: [
                        { tipo: 'Geral', preco: 15000, quantidade: 500 },
                    ]
                }
            }
        });
        console.log('✅ Success');
    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await (prisma as any).$disconnect();
    }
}

main();
