"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Target, Users } from "lucide-react";
import Link from "next/link";
import TeamCarousel from "@/components/TeamCarousel";
import HeroSection from "@/components/HeroSection";

const values = [
    {
        icon: Shield,
        title: "Confiança",
        description:
            "Construímos relações duradouras baseadas na transparência, integridade e segurança em tudo o que fazemos.",
    },
    {
        icon: Zap,
        title: "Inovação",
        description:
            "Procuramos constantemente novas tecnologias e soluções criativas para superar os desafios dos nossos clientes.",
    },
    {
        icon: Target,
        title: "Excelência",
        description:
            "Comprometemo-nos com a qualidade superior em cada projeto, entrega e interação.",
    },
    {
        icon: Users,
        title: "Parceria",
        description:
            "Trabalhamos lado a lado com os nossos clientes, entendendo os seus objetivos como se fossem os nossos.",
    },
];

interface AboutContentProps {
    teamMembers?: any[];
}

export default function AboutContent({ teamMembers }: AboutContentProps) {
    return (
        <div className="relative bg-background text-foreground min-h-screen">
            {/* Hero Section */}
            <HeroSection
                title="Sobre a VA"
                subtitle="O parceiro tecnológico que impulsiona o seu negócio através da convergência entre Tecnologia, Segurança e Marketing Digital"
                showScrollIndicator={true}
                backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2070&q=80"
                primaryCta="Fale Connosco"
                orderLink="/contact"
            />

            {/* Mission Section */}
            <section className="tesla-section-spacing bg-background">
                <div className="tesla-container">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-1 bg-accent rounded-full" />
                                    <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        A Nossa Missão
                                    </span>
                                </div>
                                <h2>Potenciar o Crescimento Empresarial</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    A nossa missão é democratizar o acesso a soluções
                                    tecnológicas de ponta e estratégias de marketing
                                    digital de alto impacto. Acreditamos que cada empresa,
                                    independentemente do seu tamanho, merece ter uma
                                    infraestrutura segura e uma presença digital forte.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square bg-gradient-to-br from-muted to-background rounded overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-8xl font-bold text-muted-foreground/20 mb-4">
                                            VA
                                        </div>
                                        <p className="text-muted-foreground">
                                            Tecnologia • Segurança • Marketing
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="tesla-section-spacing bg-muted/30">
                <div className="tesla-container">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative order-2 lg:order-1"
                        >
                            <div className="aspect-square bg-gradient-to-br from-background to-muted rounded overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-9xl font-bold text-muted-foreground/10">
                                        2026
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-1 bg-accent rounded-full" />
                                    <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        A Nossa Visão
                                    </span>
                                </div>
                                <h2>Líderes na Convergência Digital</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Queremos ser reconhecidos globalmente como a referência
                                    na integração de tecnologia, segurança e marketing,
                                    criando um ecossistema onde as empresas podem encontrar
                                    todas as soluções para o seu sucesso num único parceiro
                                    de confiança.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="tesla-section-spacing bg-background">
                <div className="tesla-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="mb-4">Os Nossos Valores</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Os princípios que guiam cada decisão e projeto que realizamos
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded border border-border hover:border-accent/50 transition-all bg-card"
                            >
                                <div className="w-12 h-12 mb-6 bg-accent text-accent-foreground rounded flex items-center justify-center">
                                    <value.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <TeamCarousel members={teamMembers} />

            {/* CTA Section */}
            <section className="tesla-section-spacing bg-muted/30">
                <div className="tesla-container text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="mb-6">Junte-se a Nós nesta Jornada</h2>
                        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Estamos prontos para elevar o seu negócio ao próximo nível.
                            Vamos conversar?
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact">
                                <button className="min-w-[200px] rounded px-8 py-3 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-all">
                                    Fale Connosco
                                </button>
                            </Link>
                            <Link href="/services">
                                <button className="min-w-[200px] rounded px-8 py-3 text-sm font-medium bg-transparent text-foreground hover:bg-muted/50 transition-all border border-border">
                                    Ver Serviços
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
