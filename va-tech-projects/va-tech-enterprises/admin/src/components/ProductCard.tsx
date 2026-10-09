"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ProductCardProps {
    title: string;
    description: string;
    href: string;
    icon?: LucideIcon;
    image?: string;
    delay?: number;
}

export default function ProductCard({
    title,
    description,
    href,
    icon: Icon,
    image,
    delay = 0,
}: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <Link href={href} className="group block">
                <div className="h-full rounded border border-border hover:border-accent/50 transition-all duration-300 overflow-hidden bg-card hover:shadow-lg">
                    {/* Image/Icon Section */}
                    {image ? (
                        <div className="aspect-video bg-muted overflow-hidden">
                            <div
                                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                                style={{ backgroundImage: `url(${image})` }}
                            />
                        </div>
                    ) : Icon ? (
                        <div className="aspect-video bg-gradient-to-br from-muted to-background flex items-center justify-center">
                            <Icon className="h-16 w-16 text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                    ) : (
                        <div className="aspect-video bg-gradient-to-br from-muted to-background" />
                    )}

                    {/* Content Section */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {description}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
