import { PrismaClient, UserRole, PostStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados (Luclima)...');

    // 1. Criar Utilizadores
    console.log('👤 Criando utilizadores...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@luclima.com' },
        update: {},
        create: {
            email: 'admin@luclima.com',
            name: 'Administrador Luclima',
            password: hashedAdminPassword,
            role: UserRole.SUPER_ADMIN,
        },
    });

    const tecnico = await prisma.user.upsert({
        where: { email: 'tecnico@luclima.com' },
        update: {},
        create: {
            email: 'tecnico@luclima.com',
            name: 'João Silva',
            password: hashedUserPassword,
            role: UserRole.EMPLOYEE,
        },
    });

    console.log('✅ Utilizadores criados!');

    // 2. Criar Sectores
    console.log('📁 Criando sectores...');
    const residencial = await prisma.sector.upsert({
        where: { name: 'Residencial' },
        update: {},
        create: {
            name: 'Residencial',
            description: 'Serviços especializados para casas e apartamentos.',
        },
    });

    const comercial = await prisma.sector.upsert({
        where: { name: 'Comercial' },
        update: {},
        create: {
            name: 'Comercial',
            description: 'Soluções para escritórios, lojas e estabelecimentos comerciais.',
        },
    });

    const industrial = await prisma.sector.upsert({
        where: { name: 'Industrial' },
        update: {},
        create: {
            name: 'Industrial',
            description: 'Climatização e manutenção para grandes indústrias e fábricas.',
        },
    });

    console.log('✅ Sectores criados!');

    // 3. Criar Serviços
    console.log('🛠️ Criando serviços...');
    const servicos = [
        {
            name: 'Instalação de Ar Condicionado',
            description: 'Instalação profissional de sistemas split, multi-split e VRF.',
            sectorId: residencial.id,
            order: 1,
        },
        {
            name: 'Manutenção de AC',
            description: 'Revisão técnica, carga de gás e limpeza de componentes.',
            sectorId: residencial.id,
            order: 2,
        },
        {
            name: 'Higienização Química',
            description: 'Limpeza profunda contra fungos e bactérias com produtos certificados.',
            sectorId: comercial.id,
            order: 3,
        },
        {
            name: 'Desinfestação e Dedetização',
            description: 'Controle integrado de pragas em ambientes residenciais e comerciais.',
            sectorId: comercial.id,
            order: 4,
        },
    ];

    for (const s of servicos) {
        const existingService = await prisma.service.findFirst({
            where: { name: s.name, sectorId: s.sectorId }
        });

        if (!existingService) {
            await prisma.service.create({
                data: s,
            });
        }
    }

    console.log('✅ Serviços criados!');

    // 4. Categorias de Blog
    console.log('📝 Criando categorias de blog...');
    const catDicas = await prisma.category.upsert({
        where: { slug: 'dicas' },
        update: { name: 'Dicas e Cuidados' },
        create: { name: 'Dicas e Cuidados', slug: 'dicas' },
    });

    // 5. Posts de Blog
    console.log('📑 Criando artigos...');
    await prisma.post.upsert({
        where: { slug: 'eficiencia-energetica-ac' },
        update: {},
        create: {
            title: 'Como economizar energia com o seu Ar Condicionado',
            slug: 'eficiencia-energetica-ac',
            content: 'Utilizar o aparelho na temperatura ideal de 23°C pode reduzir drasticamente o consumo energético. Além disso, a manutenção regular dos filtros impede que o motor trabalhe sob esforço excessivo.',
            excerpt: 'Pequenas mudanças no uso diário podem gerar grande economia na fatura de luz.',
            status: PostStatus.PUBLISHED,
            authorId: admin.id,
            categoryId: catDicas.id,
        },
    });

    console.log('🎉 Seed Luclima concluído com sucesso!');
    console.log('📧 Admin: admin@luclima.com | Pass: admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
