import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection, { HeroSlide } from "@/components/HeroSection";
import QuickLinks from "@/components/QuickLinks";
import ProductCarousel from "@/components/ProductCarousel";
import FeatureShowcase from "@/components/FeatureShowcase";
import IrregularCarousel from "@/components/IrregularCarousel";
import InfrastructureSection from "@/components/InfrastructureSection";
import PartnersSection from "@/components/PartnersSection";
import PerformanceSection from "@/components/PerformanceSection";

import { prisma } from "@/lib/prisma";

const heroSlides: HeroSlide[] = [
    {
        title: "VA Tech Enterprises",
        subtitle: "Liderando a Convergência entre Tecnologia e Marketing",
        primaryCta: "Explorar Serviços",
        secondaryCta: "Saber Mais",
        orderLink: "/services",
        learnMoreLink: "/about",
        backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2070&q=80",
    },
    {
        title: "Infraestrutura de Redes",
        subtitle: "Conectividade robusta para o futuro do seu negócio",
        primaryCta: "Solicitar Orçamento",
        secondaryCta: "Saber Mais",
        orderLink: "/contact?service=infrastructure",
        learnMoreLink: "/services/infrastructure",
        backgroundImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2070&q=80",
    }
];

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    // Fetch data from DB
    const [services, projects, partners] = await Promise.all([
        prisma.service.findMany({ where: { active: true }, take: 2, orderBy: { createdAt: 'desc' } }),
        prisma.project.findMany({ where: { active: true }, take: 6, orderBy: { createdAt: 'desc' } }),
        prisma.partner.findMany({ where: { active: true }, orderBy: { order: 'asc' } })
    ]);

    // Map DB items to component props
    const serviceItems: any = services.length >= 2 ? services.map((s: any) => ({
        title: s.title,
        subtitle: s.description,
        image: s.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2070&q=80",
        link: `/services`
    })) : [
        {
            title: "Sistemas Inteligentes",
            subtitle: "Automação e IA integradas nos seus processos de negócio.",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2070&q=80",
            link: "/services"
        },
        {
            title: "Suporte VIP",
            subtitle: "Acompanhamento 24/7 de alta prioridade.",
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2070&q=80",
            link: "/contact"
        }
    ];

    const projectItems = projects.length > 0 ? projects.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image || "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=2070&q=80",
        link: `/portfolio`
    })) : undefined;

    return (
        <div className="relative bg-background text-foreground">
            <Header />

            {/* 0. Performance Section (CEO Hero) */}
            <PerformanceSection />

            {/* 1. Hero Slider */}
            <HeroSection slides={heroSlides} autoPlay interval={6000} />

            {/* 2. Quick Links / Secondary Nav */}
            <QuickLinks />

            {/* 3. Main Product Showcase - Large Carousel (Portfolio) */}
            <ProductCarousel title="Ultimos Projectos" items={projectItems} />

            {/* 4. Split Grid - Offers/Special Sections */}
            <FeatureShowcase />

            {/* 5. Irregular Feature Grid - Modern Tech Display (Services) */}
            <IrregularCarousel
                title="Sectores de Atuação"
                items={[serviceItems[0], serviceItems[1]]}
            />

            <div className="py-24">
                <PartnersSection partners={partners} />
            </div>

            <Footer />
        </div>
    );
}


