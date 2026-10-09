import {
    Network,
    Shield,
    Camera,
    Megaphone,
    Target,
    Share2,
    Monitor,
    Globe,
    Server,
    Lock,
    Eye,
    BarChart,
    MousePointer,
    MessageCircle,
    Cpu,
    Code
} from "lucide-react";

export const services = [
    {
        id: "infrastructure",
        icon: Network,
        title: "Infraestrutura de Redes",
        description: "Planeamento, instalação e manutenção de redes de computadores para garantir estabilidade, velocidade e desempenho da sua empresa.",
        features: [
            "Instalação de redes cabeadas e Wi-Fi",
            "Configuração de servidores",
            "Monitorização e manutenção 24/7",
            "Otimização de performance"
        ],
        longDescription: `
            <p>Uma infraestrutura de rede robusta é a espinha dorsal de qualquer negócio moderno. Na VA, oferecemos soluções completas de infraestrutura que garantem que a sua empresa esteja sempre conectada, segura e a operar na máxima velocidade.</p>
            <h3>O que incluímos:</h3>
            <ul>
                <li><strong>Planeamento e Design:</strong> Desenhamos a arquitetura de rede ideal para o seu espaço e necessidades.</li>
                <li><strong>Cablagem Estruturada:</strong> Instalação profissional certificada de cabos de rede (Cat6, Cat6a, Cat7) e fibra ótica.</li>
                <li><strong>Soluções Wi-Fi:</strong> Cobertura total e sem falhas com sistemas Mesh e Access Points de alta densidade.</li>
                <li><strong>Configuração de Ativos:</strong> Configuração avançada de Routers, Switches e Firewalls.</li>
            </ul>
        `,
        image: "/images/blog-hardware.png" // Reusing appropriate image
    },
    {
        id: "cybersecurity",
        icon: Shield,
        title: "Cibersegurança",
        description: "Proteção de dados, sistemas e redes contra ataques, vírus e acessos não autorizados, garantindo segurança e confiança.",
        features: [
            "Auditorias de segurança",
            "Proteção contra malware",
            "Gestão de acessos e identidades",
            "Resposta a incidentes"
        ],
        longDescription: `
            <p>Num mundo cada vez mais digital, os dados são o ativo mais valioso da sua empresa. As nossas soluções de cibersegurança protegem o seu negócio contra ameaças em constante evolução.</p>
            <h3>Os nossos serviços de proteção:</h3>
            <ul>
                <li><strong>Análise de Vulnerabilidades:</strong> Identificamos e corrigimos falhas de segurança antes que sejam exploradas.</li>
                <li><strong>Proteção Endpoint:</strong> Antivírus de nova geração e soluções EDR para proteger todos os dispositivos.</li>
                <li><strong>Firewall e Segurança de Rede:</strong> Bloqueio de acessos não autorizados e filtragem de conteúdo.</li>
                <li><strong>Formação e Consciencialização:</strong> Treinamos a sua equipa para reconhecer e evitar ataques de phishing e engenharia social.</li>
            </ul>
        `,
        image: "/images/blog-shield.png"
    },
    {
        id: "cctv",
        icon: Camera,
        title: "CCTV",
        description: "Sistema de videovigilância para monitoramento 24H, aumentando a segurança de empresas, residências e instalações.",
        features: [
            "Câmaras de alta definição",
            "Monitorização remota",
            "Gravação na cloud",
            "Alertas em tempo real"
        ],
        longDescription: `
            <p>Mantenha os olhos no seu negócio, onde quer que esteja. Os nossos sistemas de videovigilância modernos oferecem imagem de alta definição e acesso remoto fácil.</p>
            <h3>Funcionalidades principais:</h3>
            <ul>
                <li><strong>Câmaras IP de Alta Resolução:</strong> Imagens nítidas, mesmo em condições de baixa luminosidade.</li>
                <li><strong>Acesso Móvel:</strong> Visualize as suas câmaras em tempo real através do seu smartphone ou tablet.</li>
                <li><strong>Detecção de Movimento Inteligente:</strong> Receba alertas apenas quando importa, ignorando falsos alarmes.</li>
                <li><strong>Integração:</strong> Integre o CCTV com o seu sistema de alarme e controlo de acessos.</li>
            </ul>
        `,
        image: "/images/blog-biometric.png"
    },
    {
        id: "digital-marketing",
        icon: Megaphone,
        title: "Marketing Digital",
        description: "Estratégias digitais para aumentar a visibilidade da sua marca e atrair mais clientes online.",
        features: [
            "SEO e otimização web",
            "Campanhas de email marketing",
            "Criação de conteúdos",
            "Análise de métricas"
        ],
        longDescription: `
            <p>Não basta ter um bom produto, é preciso que o mundo o conheça. A nossa equipa de marketing digital cria estratégias personalizadas para colocar a sua marca à frente da concorrência.</p>
        `,
        image: "/images/blog-marketing.jpg"
    },
    {
        id: "paid-traffic",
        icon: Target,
        title: "Tráfego Pago",
        description: "Criação e gestão de anúncios pagos para gerar resultados rápidos, leads qualificados e aumento de vendas.",
        features: [
            "Google Ads",
            "Facebook & Instagram Ads",
            "LinkedIn Ads",
            "Remarketing"
        ],
        longDescription: `
            <p>Acelere o crescimento do seu negócio com campanhas de publicidade paga altamente direcionadas. Maximizamos o seu ROI garantindo que os seus anúncios chegam às pessoas certas.</p>
        `,
        image: "/images/blog-marketing.jpg"
    },
    {
        id: "social-media",
        icon: Share2,
        title: "Gestão de Redes Sociais",
        description: "Planeamento, criação de conteúdos e gestão das redes sociais para melhorar o relacionamento com clientes e a imagem da marca.",
        features: [
            "Estratégia de conteúdo",
            "Design de posts",
            "Gestão de comunidade",
            "Relatórios mensais"
        ],
        longDescription: `
            <p>As redes sociais são onde as conversas acontecem. Gerimos a presença da sua marca no Facebook, Instagram, LinkedIn e outras plataformas, criando uma comunidade fiel e envolvida.</p>
        `,
        image: "/images/blog-marketing.jpg"
    },
    {
        id: "hardware",
        icon: Monitor,
        title: "Venda de Materiais Informáticos",
        description: "Fornecimento de equipamentos e acessórios informáticos de qualidade para atender às necessidades do seu negócio.",
        features: [
            "Computadores e portáteis",
            "Servidores e storage",
            "Acessórios e periféricos",
            "Suporte técnico"
        ],
        longDescription: `
            <p>Fornecemos todo o hardware necessário para o seu escritório, desde computadores de alto desempenho a servidores, impressoras e acessórios. Trabalhamos com as melhores marcas do mercado.</p>
        `,
        image: "/images/blog-hardware.png"
    },
    {
        id: "web-development",
        icon: Globe,
        title: "Desenvolvimento de Websites",
        description: "Criação de sites modernos, responsivos e profissionais para fortalecer a presença digital da sua empresa.",
        features: [
            "Sites institucionais",
            "Lojas online (e-commerce)",
            "Landing pages",
            "Sistemas web personalizados"
        ],
        longDescription: `
            <p>O seu site é a sua montra digital. Desenvolvemos sites rápidos, seguros e otimizados para telemóveis, desenhados para converter visitantes em clientes.</p>
        `,
        image: "/images/blog-workspace.png"
    }
];
