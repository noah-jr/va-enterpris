

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services } from "@/data/services";
import { ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { use } from "react";

// Adapting to Next.js 15+ async params
type PageProps = {
    params: Promise<{ slug: string }>;
};

// Since we can't export metadata from a client component easily with dynamic data in the same file if using 'use client', 
// we might need to separate this. But for now, keeping the structure but fixing the component first.
// If this file must be a client component (hooks?), we can't export metadata from it in the same way if it causes issues.
// But the original file didn't have 'use client' at the very top? 
// No, line 1 of previous file did NOT have 'use client', but line 30 imported something.
// Wait, line 1 NOT show 'use client' in the previous `view_file` output?
// Ah, `view_file` output shows line 1: `import VAHeader...`.
// But `Header` uses `use client` (hooks). So this page likely needs to be a server component if possible, 
// or if it imports client components it can be server.
// However, the previous `ContactPage` had "use client" at top.
// This `ServiceDetailPage` in previous view did NOT have "use client" at top.
// So it is a Server Component.
// But `Header` is a client component. That's fine.

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const service = services.find((s) => s.id === slug);

    if (!service) {
        return {
            title: 'Serviço não encontrado | VA',
        };
    }

    return {
        title: `${service.title} | Serviços VA`,
        description: service.description,
    };
}

export default async function ServiceDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const service = services.find((s) => s.id === slug);

    if (!service) {
        notFound();
    }

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-muted/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />

                <div className="relative tesla-container px-4">
                    <Link
                        href="/services"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar aos Serviços
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-16 h-16 mb-6 rounded-2xl bg-accent/10 flex items-center justify-center backdrop-blur-sm border border-accent/20">
                                <service.icon className="h-8 w-8 text-accent" />
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                                {service.title}
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-xl">
                                {service.description}
                            </p>
                        </div>
                        {/* Optional: Hero Image specific to service could go here */}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="tesla-container px-4">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {service.image && (
                                <div className="mb-10 rounded-2xl overflow-hidden h-[400px] md:h-[500px] relative">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                                </div>
                            )}

                            <div className="prose prose-lg max-w-none text-muted-foreground dark:prose-invert">
                                <div dangerouslySetInnerHTML={{ __html: service.longDescription || '' }} />
                            </div>

                            <div className="mt-12">
                                <h3 className="text-2xl font-bold mb-6">Principais Características</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {service.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                                            <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                                            <span className="font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / CTA */}
                        <div className="space-y-8">
                            <div className="bg-card text-card-foreground p-8 rounded-3xl sticky top-24 border border-border">
                                <h3 className="text-2xl font-bold mb-4">Pronto para avançar?</h3>
                                <p className="text-muted-foreground mb-8">
                                    Fale connosco hoje mesmo e descubra como podemos implementar esta solução na sua empresa.
                                </p>
                                <Button size="lg" className="w-full h-12" asChild>
                                    <Link href="/contact">
                                        Pedir Orçamento Gratuito
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>

                                <div className="mt-8 pt-8 border-t border-border">
                                    <p className="text-sm text-muted-foreground mb-2">Ou ligue-nos:</p>
                                    <a href="tel:+244934819272" className="text-xl font-bold hover:text-accent transition-colors">
                                        +244 934 819 272
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-muted/30 border-t border-border">
                <div className="tesla-container px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ainda com dúvidas?</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        A nossa equipa de especialistas está disponível para esclarecer todas as suas questões sobre {service.title}.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" size="lg" className="hover:bg-accent/10" asChild>
                            <Link href="/contact">
                                Falar com Especialista
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
