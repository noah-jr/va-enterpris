import { prisma } from './src/infrastructure/database/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🌱 Starting seed...');

    try {
        // Clean up
        await prisma.comment.deleteMany();
        await prisma.blogPost.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.ticketType.deleteMany();
        await prisma.event.deleteMany();
        await prisma.user.deleteMany();

        console.log('🧹 DB Cleaned');

        const adminPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                nome: 'Administrador VA',
                email: 'admin@vaevents.co.ao',
                password: adminPassword,
                role: 'ADMIN',
            },
        });

        const event = await prisma.event.create({
            data: {
                titulo: 'Show do Bonga - 50 Anos de Carreira',
                descricao: 'Uma noite histórica',
                data: new Date('2024-12-25T20:00:00Z'),
                local: 'Baía de Luanda',
                vagas: 1000,
                image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80',
                preco_min: 15000,
                status: 'PUBLICADO',
            }
        });

        await prisma.ticketType.create({
            data: {
                event_id: event.id,
                tipo: 'Geral',
                preco: 15000,
                quantidade: 500
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
