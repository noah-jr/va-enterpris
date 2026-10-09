"use client";

import { useState } from "react";
import { Linkedin, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TeamMemberProp {
    id: string | number;
    name: string;
    role: string;
    image?: string | null;
    bio?: string | null;
    linkedin?: string | null;
    email?: string | null;
}

interface TeamCarouselProps {
    members?: TeamMemberProp[];
}

const defaultTeamMembers = [
    {
        id: 1,
        name: "João Silva",
        role: "CEO & Fundador",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
        bio: "Visionário com mais de 15 anos de experiência em tecnologia e inovação.",
        linkedin: "#",
        email: "joao@vatech.com"
    },
    {
        id: 2,
        name: "Maria Santos",
        role: "Diretora de Operações",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        bio: "Especialista em otimização de processos e gestão de high-performance.",
        linkedin: "#",
        email: "maria@vatech.com"
    },
    {
        id: 3,
        name: "Carlos Mendes",
        role: "CTO",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
        bio: "Arquiteto de soluções robustas para infraestruturas críticas.",
        linkedin: "#",
        email: "carlos@vatech.com"
    },
    {
        id: 4,
        name: "Ana Oliveira",
        role: "Head de Marketing",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
        bio: "Estratégica, focada em elevar a presença digital das marcas.",
        linkedin: "#",
        email: "ana@vatech.com"
    },
    {
        id: 5,
        name: "Pedro Costa",
        role: "Líder de Cibersegurança",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
        bio: "Certificado em segurança ofensiva e defensiva.",
        linkedin: "#",
        email: "pedro@vatech.com"
    }
];

export default function TeamCarousel({ members }: TeamCarouselProps) {
    const displayMembers = members && members.length > 0 ? members : defaultTeamMembers;
    const [currentIndex, setCurrentIndex] = useState(0);

    const itemWidth = 320;
    const gap = 24;

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % displayMembers.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + displayMembers.length) % displayMembers.length);
    };

    return (
        <section className="py-24 overflow-hidden bg-background">
            <div className="tesla-container px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">A Nossa Equipa</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Talento e dedicação que movem o futuro.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-3 border border-border/50 rounded-full hover:bg-secondary transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-3 border border-border/50 rounded-full hover:bg-secondary transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="mx-auto">
                    <motion.div
                        className="flex gap-6 cursor-grab active:cursor-grabbing"
                        animate={{ x: -(currentIndex * (itemWidth + gap)) }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = offset.x;
                            if (swipe < -50) {
                                handleNext();
                            } else if (swipe > 50) {
                                handlePrev();
                            }
                        }}
                    >
                        {displayMembers.map((member) => (
                            <div key={member.id} className="shrink-0 w-[280px] md:w-[320px] group relative">
                                <div className="aspect-[3/4] overflow-hidden bg-secondary/30 mb-6 rounded-sm">
                                    <img
                                        src={member.image || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=320&h=420&fit=crop&q=80"}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 saturate-0 group-hover:saturate-100"
                                    />
                                    {/* Overlay minimalista */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                        {member.linkedin && (
                                            <Link href={member.linkedin} className="text-white hover:text-white/80 transition-colors">
                                                <Linkedin className="h-5 w-5" />
                                            </Link>
                                        )}
                                        {member.email && (
                                            <Link href={`mailto:${member.email}`} className="text-white hover:text-white/80 transition-colors">
                                                <Mail className="h-5 w-5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-medium tracking-tight mb-1 group-hover:text-foreground/80 transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                        {member.role}
                                    </p>
                                    <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
