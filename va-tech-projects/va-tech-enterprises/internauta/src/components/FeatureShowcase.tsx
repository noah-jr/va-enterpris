"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface FeatureCardProps {
    title: string;
    subtitle: string;
    image: string;
    link: string;
    linkText: string;
}

const FeatureCard = ({ title, subtitle, image, link, linkText }: FeatureCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative group overflow-hidden rounded-xl bg-muted h-[500px] md:h-[650px] shadow-xl"
    >
        <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
            <h3 className="text-3xl font-bold mb-2">{title}</h3>
            <p className="text-lg opacity-90 mb-8 max-w-md">{subtitle}</p>
            <div>
                <Link
                    href={link}
                    className="inline-block px-8 py-3 bg-white text-black rounded-sm font-medium hover:bg-white/90 transition-colors"
                >
                    {linkText}
                </Link>
            </div>
        </div>
    </motion.div>
);

export default function FeatureShowcase() {
    return (
        <section className="py-24 bg-background">
            <div className="tesla-container px-6 grid md:grid-cols-2 gap-6">
                <FeatureCard
                    title="Ofertas Atuais"
                    subtitle="Explore as nossas condições especiais para soluções de infraestrutura e marketing."
                    image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2070&q=80"
                    link="/services"
                    linkText="Saber Mais"
                />
                <FeatureCard
                    title="Soluções Corporativas"
                    subtitle="Pacotes exclusivos para empresas que buscam transformação digital completa."
                    image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2070&q=80"
                    link="/contact"
                    linkText="Explorar"
                />
            </div>
        </section>
    );
}
