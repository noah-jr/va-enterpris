"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Network, Shield, Megaphone, Smartphone } from "lucide-react";

const links = [
    { icon: Network, label: "Redes", href: "/services/infrastructure" },
    { icon: Shield, label: "Cibersegurança", href: "/services/cybersecurity" },
    { icon: Megaphone, label: "Marketing", href: "/services/digital-marketing" },
    { icon: Smartphone, label: "Suporte", href: "/contact" },
];

export default function QuickLinks() {
    return (
        <div className="bg-background py-8 border-b border-border/50">
            <div className="tesla-container px-6 flex flex-wrap justify-center gap-4 md:gap-12">
                {links.map((link, idx) => (
                    <Link key={idx} href={link.href} className="group flex items-center gap-3 py-2 px-4 rounded-full hover:bg-secondary transition-colors">
                        <div className="p-2 rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <link.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium tracking-tight whitespace-nowrap">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
