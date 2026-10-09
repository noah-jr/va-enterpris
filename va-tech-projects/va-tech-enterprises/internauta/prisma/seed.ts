import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()

async function main() {
    // Seed Sectors
    const sectors = [
        { name: "Infraestrutura de Redes", icon: "Network" },
        { name: "Cibersegurança", icon: "Shield" },
        { name: "CCTV", icon: "Camera" },
        { name: "Marketing Digital", icon: "Megaphone" },
        { name: "Tráfego Pago", icon: "ArrowUpRight" },
        { name: "Websites", icon: "Globe" },
        { name: "Redes Sociais", icon: "Share2" },
    ];

    console.log("Seeding sectors...");
    for (const sector of sectors) {
        await prisma.sector.upsert({
            where: { name: sector.name },
            update: {
                icon: sector.icon
            },
            create: sector
        });
    }

    const services = [
        {
            slug: "infrastructure",
            title: "Infraestrutura de Redes",
            category: "TI & Infraestrutura",
            description: "Planeamento, instalação e manutenção de redes de computadores para garantir estabilidade, velocidade e desempenho da sua empresa.",
            longDescription: "<p>Uma infraestrutura de rede robusta é a espinha dorsal de qualquer negócio moderno. Na VA, oferecemos soluções completas de infraestrutura que garantem que a sua empresa esteja sempre conectada, segura e a operar na máxima velocidade.</p><h3>O que incluímos:</h3><ul><li><strong>Planeamento e Design:</strong> Desenhamos a arquitetura de rede ideal para o seu espaço e necessidades.</li><li><strong>Cablagem Estruturada:</strong> Instalação profissional certificada de cabos de rede (Cat6, Cat6a, Cat7) e fibra ótica.</li><li><strong>Soluções Wi-Fi:</strong> Cobertura total e sem falhas com sistemas Mesh e Access Points de alta densidade.</li><li><strong>Configuração de Ativos:</strong> Configuração avançada de Routers, Switches e Firewalls.</li></ul>",
            icon: "Network",
            image: "/images/blog-hardware.png",
            features: ["Instalação de redes cabeadas e Wi-Fi", "Configuração de servidores", "Monitorização e manutenção 24/7", "Otimização de performance"]
        },
        {
            slug: "cybersecurity",
            title: "Cibersegurança",
            category: "TI & Infraestrutura",
            description: "Proteção de dados, sistemas e redes contra ataques, vírus e acessos não autorizados, garantindo segurança e confiança.",
            longDescription: "<p>Num mundo cada vez mais conectado, a segurança da informação é crítica. As nossas soluções de cibersegurança protegem o seu negócio contra ameaças conhecidas e emergentes.</p>",
            icon: "Shield",
            image: "/images/blog-shield.png",
            features: ["Análise de Vulnerabilidades", "Proteção contra Ransomware", "Firewalls Next-Gen", "Formação de Consciencialização"]
        },
        {
            slug: "cctv",
            title: "CCTV",
            category: "Segurança",
            description: "Sistema de videovigilância para monitoramento 24H, aumentando a segurança de empresas, residências e instalações.",
            icon: "Camera",
            image: "/images/blog-biometric.png",
            longDescription: "<p>Monitorize o seu património em tempo real com as nossas soluções de CCTV de alta definição.</p>",
            features: ["Câmeras IP de Alta Definição", "Gravação em NVR/Cloud", "Acesso Remoto via App", "Detecção de Movimento Inteligente"]
        },
        {
            slug: "digital-marketing",
            title: "Marketing Digital",
            category: "Marketing & Digital",
            description: "Estratégias digitais para aumentar a visibilidade da sua marca e atrair mais clientes online.",
            icon: "Megaphone",
            image: "/images/blog-marketing.jpg",
            longDescription: "<p>Impulsione o seu crescimento com estratégias de marketing digital focadas em resultados.</p>",
            features: ["SEO (Otimização para Motores de Busca)", "Email Marketing", "Marketing de Conteúdo", "Copywriting Persuasivo"]
        },
        {
            slug: "paid-traffic",
            title: "Tráfego Pago",
            category: "Marketing & Digital",
            description: "Criação e gestão de anúncios pagos para gerar resultados rápidos, leads qualificados e aumento de vendas.",
            icon: "Target",
            image: "/images/blog-marketing.jpg",
            longDescription: "<p>Alcance o seu público-alvo ideal instantaneamente com campanhas de tráfego pago otimizadas.</p>",
            features: ["Google Ads", "Meta Ads (Facebook & Instagram)", "Linkedin Ads", "Remarketing"]
        },
        {
            slug: "social-media",
            title: "Gestão de Redes Sociais",
            category: "Marketing & Digital",
            description: "Planeamento, criação de conteúdos e gestão das redes sociais para melhorar o relacionamento com clientes e a imagem da marca.",
            icon: "Share2",
            image: "/images/blog-marketing.jpg",
            longDescription: "<p>Construa uma comunidade engajada e fiel à sua marca nas redes sociais.</p>",
            features: ["Criação de Calendário Editorial", "Design de Posts e Stories", "Gestão de Comunidade", "Relatórios de Desempenho"]
        },
        {
            slug: "hardware",
            title: "Venda de Materiais Informáticos",
            category: "Equipamentos",
            description: "Fornecimento de equipamentos e acessórios informáticos de qualidade para atender às necessidades do seu negócio.",
            icon: "Monitor",
            image: "/images/blog-hardware.png",
            longDescription: "<p>Equipe a sua empresa com o melhor hardware do mercado.</p>",
            features: ["Computadores e Laptops", "Servidores e Storage", "Periféricos e Acessórios", "Licenciamento de Software"]
        },
        {
            slug: "web-development",
            title: "Desenvolvimento de Websites",
            category: "Marketing & Digital",
            description: "Criação de sites modernos, responsivos e profissionais para fortalecer a presença digital da sua empresa.",
            icon: "Globe",
            image: "/images/blog-workspace.png",
            longDescription: "<p>O seu site é a sua vitrine digital. Desenvolvemos sites que convertem visitantes em clientes.</p>",
            features: ["Sites Institucionais", "Lojas Online (E-commerce)", "Landing Pages", "Manutenção e Suporte"]
        }
    ]

    for (const s of services) {
        const { features, ...data } = s
        console.log(`Seeding service: ${s.title}`)
        await prisma.service.upsert({
            where: { slug: s.slug },
            update: {
                image: s.image,
                category: s.category
            },
            create: {
                ...data,
                features: {
                    create: features.map(f => ({ text: f }))
                }
            }
        })
    }

    // Seed Projects
    const projects = [
        {
            id: "rebranding-techcorp",
            title: "Rebranding TechCorp",
            slug: "rebranding-techcorp",
            category: "Identidade Visual",
            description: "Renovação completa da marca para uma multinacional de tecnologia, focando em minimalismo e futuro.",
            image: "/portfolio-1.png",
            year: "2024",
            client: "TechCorp Global",
            featured: true
        },
        {
            id: "campaign-future-now",
            title: "Campanha 'Future Now'",
            slug: "campaign-future-now",
            category: "Marketing Digital",
            description: "Estratégia multicanal que aumentou o engagement em 300% através de infográficos virais.",
            image: "/portfolio-2.jpg",
            year: "2024",
            client: "Future Systems",
            featured: true
        },
        {
            id: "stationery-premium",
            title: "Stationery Premium",
            slug: "stationery-premium",
            category: "Design Gráfico",
            description: "Material corporativo de luxo para escritório de advocacia internacional.",
            image: "/portfolio-3.png",
            year: "2023",
            client: "Global Legal Partners",
            featured: false
        },
        {
            id: "merch-va-tech",
            title: "Merch VA Tech",
            slug: "merch-va-tech",
            category: "Branding Interno",
            description: "Desenvolvimento de linha de produtos para fortalecer a cultura organizacional.",
            image: "/portfolio-4.png",
            year: "2024",
            client: "VA Tech Internal",
            featured: false
        }
    ]

    for (const p of projects) {
        console.log(`Seeding project: ${p.title}`)
        await prisma.project.upsert({
            where: { slug: p.slug },
            update: {
                image: p.image,
                category: p.category,
                description: p.description,
                year: p.year,
                client: p.client
            },
            create: p
        })
    }

    // Seed Admin User
    const adminPassword = "admin123";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
        where: { email: "admin@va.com" },
        update: {
            password: hashedAdminPassword
        },
        create: {
            email: "admin@va.com",
            name: "Admin VA",
            password: hashedAdminPassword,
            role: "ADMIN"
        }
    })

    // Seed Internauta
    const internautaEmail = "internauta@test.com";
    const hashedInternautaPassword = await bcrypt.hash("internauta123", 10);

    console.log("Seeding internauta...")
    const internauta = await prisma.internauta.upsert({
        where: { email: internautaEmail },
        update: {
            password: hashedInternautaPassword,
            status: "ACTIVE"
        },
        create: {
            email: internautaEmail,
            firstName: "Teste",
            lastName: "Internauta",
            password: hashedInternautaPassword,
            status: "ACTIVE",
            howDidYouHear: "Seeding",
            city: "Luanda",
            image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
        }
    })

    // Seed Blog Posts
    const blogPosts = [
        {
            slug: "importancia-ciberseguranca-2025",
            title: "A Importância da Cibersegurança em 2025",
            excerpt: "Descubra as principais ameaças digitais deste ano e como proteger a sua empresa de ataques cibernéticos.",
            content: "<p>Com a evolução rápida da tecnologia, as ameaças cibernéticas tornaram-se mais sofisticadas e frequentes. Em 2025, a cibersegurança não é apenas uma opção, mas uma necessidade fundamental...</p>",
            coverImage: "/images/blog-shield.png",
            tags: "Cibersegurança, Tecnologia",
            authorEmail: "admin@va.com"
        },
        {
            slug: "otimizar-infraestrutura-ti",
            title: "Como Otimizar a Infraestrutura de TI",
            excerpt: "Dicas práticas para reduzir custos e aumentar a eficiência da sua infraestrutura de rede e servidores.",
            content: "<p>Uma infraestrutura de TI otimizada é o coração de uma empresa eficiente. Muitas organizações sofrem com custos elevados...</p>",
            coverImage: "/images/blog-hardware.png",
            tags: "Infraestrutura, Hardware",
            authorEmail: "admin@va.com"
        },
        {
            slug: "tendencias-marketing-digital-b2b",
            title: "Tendências de Marketing Digital para B2B",
            excerpt: "Estratégias avançadas de marketing digital focadas no setor B2B para gerar leads qualificados.",
            content: "<p>O marketing B2B está a passar por uma transformação. A personalização e a automação são as chaves para conquistar clientes empresariais exigentes.</p><h2>Account-Based Marketing (ABM)</h2><p>Focar esforços em contas específicas de alto valor tem mostrado um ROI superior em comparação com abordagens genéricas.</p>",
            coverImage: "/images/blog-marketing.jpg",
            tags: "Marketing, Estratégia",
            authorEmail: "admin@va.com"
        },
        {
            slug: "revolucao-biometria-seguranca",
            title: "A Revolução da Biometria na Segurança",
            excerpt: "Como as tecnologias de reconhecimento biométrico estão a redefinir o controlo de acessos e a identidade digital.",
            content: "<p>Senhas podem ser roubadas, mas a sua biometria é única. A integração de leitores de impressão digital e reconhecimento facial está a tornar os acessos físicos e digitais muito mais seguros.</p>",
            coverImage: "/images/blog-biometric.png",
            tags: "Tecnologia, Segurança",
            authorEmail: "admin@va.com"
        },
        {
            slug: "futuro-trabalho-hibrido",
            title: "O Futuro do Trabalho Híbrido",
            excerpt: "Tecnologias e práticas essenciais para manter a produtividade e a cultura da empresa em ambientes de trabalho remoto.",
            content: "<p>O trabalho híbrido veio para ficar. As empresas precisam de ferramentas que permitam a colaboração fluida entre quem está no escritório e quem está em casa.</p>",
            coverImage: "/images/blog-workspace.png",
            tags: "Trabalho, Inovação",
            authorEmail: "admin@va.com"
        }
    ];

    const admin = await prisma.user.findUnique({ where: { email: "admin@va.com" } });
    if (admin) {
        for (const post of blogPosts) {
            const { authorEmail, ...postData } = post;
            console.log(`Seeding blog post: ${postData.title}`)
            const createdPost = await prisma.post.upsert({
                where: { slug: postData.slug },
                update: {
                    coverImage: postData.coverImage,
                    tags: postData.tags,
                    content: postData.content
                },
                create: {
                    ...postData,
                    authorId: admin.id
                }
            });

            // Add some initial likes and comments
            await prisma.postLike.upsert({
                where: {
                    postId_internautaId: {
                        postId: createdPost.id,
                        internautaId: internauta.id
                    }
                },
                update: {},
                create: {
                    postId: createdPost.id,
                    internautaId: internauta.id
                }
            });

            // Check if comment exists to avoid duplicates
            const existingComment = await prisma.comment.findFirst({
                where: {
                    postId: createdPost.id,
                    internautaId: internauta.id,
                    content: `Excelente artigo sobre ${post.tags.split(',')[0]}!`
                }
            });

            if (!existingComment) {
                await prisma.comment.create({
                    data: {
                        content: `Excelente artigo sobre ${post.tags.split(',')[0]}!`,
                        postId: createdPost.id,
                        internautaId: internauta.id
                    }
                });
            }
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
