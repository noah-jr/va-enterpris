'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="p-3 bg-foreground/10 rounded-full shrink-0">
                    <Cookie className="text-foreground w-6 h-6" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-1">A sua privacidade é importante</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Utilizamos cookies para melhorar a sua experiência no nosso site. Ao continuar a navegar, concorda com a nossa
                        <Link href="/privacidade" className="text-foreground font-medium underline underline-offset-4 ml-1 hover:text-foreground/80 transition-colors">
                            Política de Privatidade
                        </Link>.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        Recusar
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="flex-1 sm:flex-none px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all hover:scale-105"
                    >
                        Aceitar Tudo
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="hidden sm:block p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
