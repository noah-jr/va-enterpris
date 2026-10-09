import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';
import bcrypt from 'bcryptjs';
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
    console.log('🌱 Seeding database...');

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@vaevents.co.ao' },
        update: {},
        create: {
            nome: 'Administrador VA',
            email: 'admin@vaevents.co.ao',
            password: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin user created');

    // 2. Create Organizador
    const orgPassword = await bcrypt.hash('org123', 10);
    await prisma.user.upsert({
        where: { email: 'contato@unitel.co.ao' },
        update: {},
        create: {
            nome: 'Unitel Promoções',
            email: 'contato@unitel.co.ao',
            password: orgPassword,
            role: 'ORGANIZADOR',
        },
    });
    console.log('✅ Organizer created');

    // 3. Create Events
    await prisma.event.create({
        data: {
            titulo: 'Show do Bonga - 50 Anos de Carreira',
            descricao: 'Uma noite histórica na Baía de Luanda com a lenda viva da música angolana. Venha celebrar cinco décadas de semba e histórias que marcaram gerações.',
            data: new Date('2024-12-25T20:00:00Z'),
            local: 'Baía de Luanda',
            vagas: 1000,
            image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80',
            preco_min: 15000,
            status: 'PUBLICADO',
            tickets: {
                create: [
                    { tipo: 'Geral', preco: 15000, quantidade: 500 },
                    { tipo: 'VIP', preco: 45000, quantidade: 100 },
                ]
            }
        }
    });

    await prisma.event.create({
        data: {
            titulo: 'Sunset Party - Mussulo 2024',
            descricao: 'A festa de por do sol mais exclusiva de Luanda está de volta à Ilha do Mussulo. DJs internacionais, open bar e um ambiente paradisíaco.',
            data: new Date('2024-11-10T16:00:00Z'),
            local: 'Ilha do Mussulo',
            vagas: 500,
            image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80',
            preco_min: 5000,
            status: 'PUBLICADO',
            tickets: {
                create: [
                    { tipo: 'Acesso Simples', preco: 5000, quantidade: 300 },
                    { tipo: 'Mesa Premium', preco: 250000, quantidade: 10 },
                ]
            }
        }
    });

    await prisma.event.create({
        data: {
            titulo: 'Angola Tech Hub 2024',
            descricao: 'O maior evento de tecnologia e inovação em Angola. Palestras, workshops e networking com os líderes do mercado digital.',
            data: new Date('2024-10-15T09:00:00Z'),
            local: 'Centro de Convenções de Talatona',
            vagas: 1500,
            image_url: 'https://images.unsplash.com/photo-1540575861501-7ad0582373f2?auto=format&fit=crop&q=80',
            preco_min: 5000,
            status: 'PUBLICADO',
            tickets: {
                create: [
                    { tipo: 'Estudante', preco: 5000, quantidade: 200 },
                    { tipo: 'Profissional', preco: 15000, quantidade: 300 },
                ]
            }
        }
    });

    console.log('✅ Events created');

    // 4. Blog Posts
    await prisma.blogPost.createMany({
        data: [
            {
                titulo: 'Como comprar bilhetes online com segurança',
                conteudo: 'Neste guia, explicamos passo a passo como utilizar a plataforma VA Events para garantir o seu lugar nos melhores eventos de Luanda sem sair de casa.',
                image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80'
            },
            {
                titulo: 'Top 5 eventos imperdíveis este semestre',
                conteudo: 'Fizemos uma curadoria especial com os eventos que prometem parar Angola nos próximos meses. De concertos a conferências, confira a lista.',
                image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80'
            }
        ]
    });
    console.log('✅ Blog posts created');

    console.log('🚀 Seed finished successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await (prisma as any).$disconnect();
    });
