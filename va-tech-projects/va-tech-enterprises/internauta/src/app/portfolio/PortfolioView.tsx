"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PartnersSection from "@/components/PartnersSection";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Project {
    id: string;
    title: string;
    category: string;
    image: string;
    year: string;
    slug: string;
}

interface PortfolioViewProps {
    projects: Project[];
}

export default function PortfolioView({ projects }: PortfolioViewProps) {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <Header />

            {/* Simple Text Hero */}
            <section className="pt-48 pb-24 px-6">
                <div className="tesla-container max-w-5xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-8"
                    >
                        O Nosso Trabalho
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed"
                    >
                        Uma seleção de projetos onde a estratégia encontra o design.
                        Criamos soluções que impulsionam marcas e definem o futuro.
                    </motion.p>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="pb-32 px-6">
                <div className="tesla-container">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <Link href={`/portfolio/${project.slug || project.id}`} key={project.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group cursor-pointer h-full flex flex-col"
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-secondary mb-6 rounded-sm relative">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="flex justify-between items-start mt-auto">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
                                                {project.category} — {project.year}
                                            </p>
                                            <h3 className="text-xl font-medium group-hover:underline underline-offset-4 decoration-1">
                                                {project.title}
                                            </h3>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <HeroSection
                title="Tem um projeto em mente?"
                subtitle="Vamos construir algo extraordinário juntos."
                primaryCta="Iniciar Projeto"
                secondaryCta="Ver Serviços"
                orderLink="/contact"
                learnMoreLink="/services"
                backgroundImage="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2070&q=80"
            />

            <PartnersSection />
            <Footer />
        </div>
    );
}
