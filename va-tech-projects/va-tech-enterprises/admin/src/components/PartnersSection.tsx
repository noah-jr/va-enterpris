"use client";

import { motion } from "framer-motion";

interface Partner {
    name: string;
    logo?: string | null;
}

interface PartnersSectionProps {
    partners?: Partner[];
}

const defaultPartners = [
    { name: "TechCorp", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80" },
    { name: "Innovate", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80" },
    { name: "FutureSystems", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80" },
    { name: "GlobalNet", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80" },
    { name: "SecureIT", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80" },
    { name: "CloudWorks", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80" },
];

export default function PartnersSection({ partners: initialPartners }: PartnersSectionProps) {
    const displayPartners = initialPartners && initialPartners.length > 0 ? initialPartners : defaultPartners;
    // Duplicate for distinct infinite loop feeling if needed
    const marqueePartners = [...displayPartners, ...displayPartners, ...displayPartners];
    return (
        <section className="py-24 bg-background overflow-hidden border-t border-border/10">
            <div className="tesla-container px-6 mb-12 text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Empresas que confiam em nós
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <motion.div
                    className="flex gap-16 md:gap-32 px-16"
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                    style={{ width: "fit-content" }}
                >
                    {/* We render distinct sets to ensure seamless loop */}
                    {[...marqueePartners, ...marqueePartners].map((partner, index) => (
                        <div key={index} className="flex items-center justify-center grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                            {/* Placeholder logos - using text as well for clarity if image fails */}
                            <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tighter">{partner.name}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Gradient Masks for smooth fade edges */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
            </div>
        </section>
    );
}
