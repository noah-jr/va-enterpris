'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';

const navigation = [
    // { name: 'Início', href: '/' },
    { name: 'Serviços', href: '/servicos' },
    // { name: 'Portfólio', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contacto', href: '/contacto' },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-7xl ${isScrolled
                ? 'bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl rounded-2xl py-2'
                : 'bg-transparent py-4'
                }`}
        >
            <nav className="px-6">
                <div className="flex items-center h-16 relative">
                    {/* Logo - Absolute Left */}
                    <div className="absolute left-0">
                        <Logo />
                    </div>

                    {/* Desktop Navigation - Perfectly Centralized */}
                    <div className="hidden md:flex flex-1 justify-center items-center">
                        <div className="flex items-center space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all relative group"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Actions - Absolute Right */}
                    <div className="hidden md:flex items-center space-x-6 absolute right-0">
                        <Link
                            href="/solicitar-servico"
                            className="px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-black/20"
                        >
                            Orçamento
                        </Link>
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button - Absolute Right on Mobile */}
                    <div className="flex items-center space-x-4 md:hidden absolute right-0">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 animate-slide-down">
                        <div className="flex flex-col space-y-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-base font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/subscribe"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mx-4 px-6 py-3 bg-red-600 text-white rounded-md text-base font-bold hover:bg-red-700 transition-all text-center"
                            >
                                Subscribe
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
