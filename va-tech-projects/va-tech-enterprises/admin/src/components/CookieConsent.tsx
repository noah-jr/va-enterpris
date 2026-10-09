"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X, Shield } from "lucide-react";
import Link from "next/link";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verifica se já existe consentimento salvo
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            // Pequeno delay para não ser intrusivo instantaneamente
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "accepted");
        setIsVisible(false);
    };

    const declineCookies = () => {
        localStorage.setItem("cookie_consent", "declined");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center p-4 md:p-6"
                >
                    <div className="bg-background/80 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl w-full">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
                            {/* Icon & Content */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-foreground" />
                                    <h3 className="text-xl font-medium tracking-tight text-foreground">
                                        Privacidade e Cookies
                                    </h3>
                                </div>
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                    Utilizamos cookies essenciais para garantir o funcionamento do site e cookies analíticos para melhorar sua experiência.
                                    Ao continuar navegando, você concorda com nossa{" "}
                                    <Link
                                        href="/privacy"
                                        className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity font-medium"
                                    >
                                        Política de Privacidade
                                    </Link>.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                                <Button
                                    onClick={acceptCookies}
                                    className="bg-foreground text-background hover:opacity-90 rounded-full px-8 h-10 text-sm font-medium transition-all"
                                >
                                    Aceitar Tudo
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={declineCookies}
                                    className="bg-transparent border-border hover:bg-foreground hover:text-background rounded-full px-8 h-10 text-sm font-medium transition-all"
                                >
                                    Recusar
                                </Button>
                                <Link href="/privacy" className="hidden sm:block">
                                    <Button
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-foreground h-10 px-4"
                                    >
                                        Gerir
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Close Button Mobile Only or Optional */}
                        <button
                            onClick={declineCookies}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
