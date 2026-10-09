"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Service } from "@/core/domain/entities/Service";
import { Icon } from "@/components/ui/icon";
import CategorizedServices from "@/components/CategorizedServices";

interface ServicesViewProps {
    services: Service[];
}

export default function ServicesView({ services }: ServicesViewProps) {
    return (
        <div className="relative bg-background text-foreground min-h-screen">
            <Header />

            {/* Hero Section */}
            <HeroSection
                title="Nossos Serviços"
                subtitle="Soluções completas em tecnologia, segurança e marketing digital"
                primaryCta="Solicitar Orçamento"
                secondaryCta="Ver Planos"
                orderLink="/contact"
                learnMoreLink="#services"
                backgroundImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2070&q=80"
            />

            {/* Categorized Services Carousels */}
            <section id="services" className="tesla-section-spacing bg-background pt-16">
                <CategorizedServices services={services} />
            </section>

            {/* Detailed Services - Selected Featured */}
            <section className="tesla-section-spacing bg-muted/30">
                <div className="tesla-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="mb-4">Destaques em Detalhe</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Conheça as nossas soluções mais procuradas e como elas podem impulsionar o seu sucesso.
                        </p>
                    </motion.div>

                    <div className="space-y-32">
                        {services.filter(s => s.active).slice(0, 3).map((service, index) => (
                            <motion.div
                                key={service.id}
                                id={service.slug}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="grid md:grid-cols-2 gap-12 items-center"
                            >
                                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                                    <div className="w-14 h-14 mb-6 rounded bg-accent flex items-center justify-center">
                                        <Icon
                                            name={service.icon}
                                            className="h-7 w-7 text-accent-foreground"
                                        />
                                    </div>
                                    <h3 className="text-3xl font-semibold mb-4">
                                        {service.title}
                                    </h3>
                                    <p className="text-lg text-muted-foreground mb-6">
                                        {service.description}
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                                                <span className="text-foreground">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href="/contact">
                                            <button className="min-w-[200px] rounded px-8 py-3 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-all">
                                                Solicitar Orçamento
                                            </button>
                                        </Link>
                                        <Link href={`/services/${service.slug}`}>
                                            <button className="min-w-[200px] rounded px-8 py-3 text-sm font-medium bg-transparent text-foreground hover:bg-muted/50 transition-all border border-border">
                                                Saber Mais
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div
                                    className={`relative ${index % 2 === 1 ? "md:order-1" : ""
                                        }`}
                                >
                                    <div className="aspect-square rounded bg-muted flex items-center justify-center overflow-hidden">
                                        {service.image ? (
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Icon
                                                name={service.icon}
                                                className="h-32 w-32 text-muted-foreground/20"
                                            />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="tesla-section-spacing bg-background">
                <div className="tesla-container text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="mb-6">Pronto para Começar?</h2>
                        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Entre em contacto connosco e descubra como podemos ajudar a
                            transformar o seu negócio
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact">
                                <button className="min-w-[200px] rounded px-8 py-3 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-all">
                                    Contactar Agora
                                </button>
                            </Link>
                            <Link href="/about">
                                <button className="min-w-[200px] rounded px-8 py-3 text-sm font-medium bg-transparent text-foreground hover:bg-muted/50 transition-all border border-border">
                                    Sobre Nós
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
