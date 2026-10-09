"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function WhatsappButton() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000); // Show after 2s
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
            {/* Notification Bubble */}
            {isVisible && (
                <div className="absolute bottom-full right-0 mb-4 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-xl shadow-xl animate-bounce-subtle text-[11px] leading-tight">
                    <p className="font-semibold text-neutral-900 dark:text-white">Estou aqui no WhatsApp!</p>
                    <p className="text-neutral-500 mt-1">Precisa de ajuda urgente? Clique para falar comigo.</p>
                    <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-neutral-800 transform rotate-45" />
                </div>
            )}

            <Link
                href="https://wa.me/244934819272"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform hover:shadow-xl group"
                aria-label="Contactar por WhatsApp"
            >
                <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20" />
                <MessageCircle className="h-7 w-7 fill-white stroke-white group-hover:rotate-12 transition-transform" />
            </Link>
        </div>
    );
}

// Add this to your global CSS if needed, but for now I'll use inline-ish classes with tailwind if available
// Or just keep it simple.

