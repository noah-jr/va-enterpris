import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const services = [
        {
            slug: "infrastructure",
            title: "Infraestrutura de Redes",
            description: "Planeamento, instalação e manutenção de redes de computadores para garantir estabilidade, velocidade e desempenho da sua empresa.",
            longDescription: "<p>Uma infraestrutura de rede robusta é a espinha dorsal de qualquer negócio moderno. Na VA, oferecemos soluções completas de infraestrutura que garantem que a sua empresa esteja sempre conectada, segura e a operar na máxima velocidade.</p><h3>O que incluímos:</h3><ul><li><strong>Planeamento e Design:</strong> Desenhamos a arquitetura de rede ideal para o seu espaço e necessidades.</li><li><strong>Cablagem Estruturada:</strong> Instalação profissional certificada de cabos de rede (Cat6, Cat6a, Cat7) e fibra ótica.</li><li><strong>Soluções Wi-Fi:</strong> Cobertura total e sem falhas com sistemas Mesh e Access Points de alta densidade.</li><li><strong>Configuração de Ativos:</strong> Configuração avançada de Routers, Switches e Firewalls.</li></ul>",
            icon: "Network",
            features: ["Instalação de redes cabeadas e Wi-Fi", "Configuração de servidores", "Monitorização e manutenção 24/7", "Otimização de performance"]
        },
        {
            slug: "cybersecurity",
            title: "Cibersegurança",
            description: "Proteção de dados, sistemas e redes contra ataques, vírus e acessos não autorizados, garantindo segurança e confiança.",
            longDescription: "<p>Num mundo cada vez mais conectado, a segurança da informação é crítica. As nossas soluções de cibersegurança protegem o seu negócio contra ameaças conhecidas e emergentes.</p>",
            icon: "Shield",
            features: ["Análise de Vulnerabilidades", "Proteção contra Ransomware", "Firewalls Next-Gen", "Formação de Consciencialização"]
        },
        {
            slug: "cctv",
            title: "CCTV",
            description: "Sistema de videovigilância para monitoramento 24H, aumentando a segurança de empresas, residências e instalações.",
            icon: "Camera",
            longDescription: "<p>Monitorize o seu património em tempo real com as nossas soluções de CCTV de alta definição.</p>",
            features: ["Câmeras IP de Alta Definição", "Gravação em NVR/Cloud", "Acesso Remoto via App", "Detecção de Movimento Inteligente"]
        },
        {
            slug: "digital-marketing",
            title: "Marketing Digital",
            description: "Estratégias digitais para aumentar a visibilidade da sua marca e atrair mais clientes online.",
            icon: "Megaphone",
            longDescription: "<p>Impulsione o seu crescimento com estratégias de marketing digital focadas em resultados.</p>",
            features: ["SEO (Otimização para Motores de Busca)", "Email Marketing", "Marketing de Conteúdo", "Copywriting Persuasivo"]
        },
        {
            slug: "paid-traffic",
            title: "Tráfego Pago",
            description: "Criação e gestão de anúncios pagos para gerar resultados rápidos, leads qualificados e aumento de vendas.",
            icon: "Target",
            longDescription: "<p>Alcance o seu público-alvo ideal instantaneamente com campanhas de tráfego pago otimizadas.</p>",
            features: ["Google Ads", "Meta Ads (Facebook & Instagram)", "Linkedin Ads", "Remarketing"]
        },
        {
            slug: "social-media",
            title: "Gestão de Redes Sociais",
            description: "Planeamento, criação de conteúdos e gestão das redes sociais para melhorar o relacionamento com clientes e a imagem da marca.",
            icon: "Share2",
            longDescription: "<p>Construa uma comunidade engajada e fiel à sua marca nas redes sociais.</p>",
            features: ["Criação de Calendário Editorial", "Design de Posts e Stories", "Gestão de Comunidade", "Relatórios de Desempenho"]
        },
        {
            slug: "hardware",
            title: "Venda de Materiais Informáticos",
            description: "Fornecimento de equipamentos e acessórios informáticos de qualidade para atender às necessidades do seu negócio.",
            icon: "Monitor",
            longDescription: "<p>Equipe a sua empresa com o melhor hardware do mercado.</p>",
            features: ["Computadores e Laptops", "Servidores e Storage", "Periféricos e Acessórios", "Licenciamento de Software"]
        },
        {
            slug: "web-development",
            title: "Desenvolvimento de Websites",
            description: "Criação de sites modernos, responsivos e profissionais para fortalecer a presença digital da sua empresa.",
            icon: "Globe",
            longDescription: "<p>O seu site é a sua vitrine digital. Desenvolvemos sites que convertem visitantes em clientes.</p>",
            features: ["Sites Institucionais", "Lojas Online (E-commerce)", "Landing Pages", "Manutenção e Suporte"]
        }
    ]

    for (const s of services) {
        const { features, ...data } = s
        console.log(`Seeding service: ${s.title}`)
        await prisma.service.upsert({
            where: { slug: s.slug },
            update: {},
            create: {
                ...data,
                features: {
                    create: features.map(f => ({ text: f }))
                }
            }
        })
    }

    // Seed Admin User
    await prisma.user.upsert({
        where: { email: "admin@va.com" },
        update: {},
        create: {
            email: "admin@va.com",
            name: "Admin",
            password: "admin_password_hash_placeholder", // Em produção usar hash real
            role: "ADMIN"
        }
    })
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
