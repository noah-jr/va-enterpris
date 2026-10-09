"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BookOpen, Mail, Briefcase } from "lucide-react";

export default function DiscoverPage() {
    const items = [
        {
            title: "Sobre Nós",
            description: "Conheça a nossa história, missão e valores.",
            icon: Users,
            href: "/about",
            color: "text-blue-500"
        },
        {
            title: "Blog & Notícias",
            description: "Fique a par das últimas novidades tecnológicas.",
            icon: BookOpen,
            href: "/blog",
            color: "text-green-500"
        },
        {
            title: "Contactos",
            description: "Fale connosco e tire as suas dúvidas.",
            icon: Mail,
            href: "/contact",
            color: "text-purple-500"
        },
        // Placeholder for future Careers page
        {
            title: "Carreiras",
            description: "Junte-se à nossa equipa (Em breve).",
            icon: Briefcase,
            href: "/contact", // Redirect to contact for now
            color: "text-orange-500"
        }
    ];

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Header />

            <section className="pt-32 pb-20 px-4">
                <div className="tesla-container max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Descobrir VA Tech</h1>
                    <p className="text-xl text-muted-foreground mb-16">
                        Explore quem somos, o que fazemos e como podemos colaborar.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {items.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="group p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 text-left flex flex-col items-start"
                            >
                                <div className={`p-3 rounded-xl bg-muted mb-4 ${item.color} group-hover:bg-accent/10 transition-colors`}>
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
