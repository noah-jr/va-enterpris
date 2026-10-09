'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Core Navigation Items - Text Based
interface MenuItem {
    label: string;
    href: string;
    badge?: number;
}

const menuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Monitorização', href: '/monitoring' },
    { label: 'Emergências', href: '/emergencies', badge: 3 },
    { label: 'Gravações', href: '/recordings' },
    { label: 'Usuários', href: '/users' },
    { label: 'Auditoria', href: '/audit-logs' },
];

export const FloatingHeader = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Main Header - Full Width, No Radius, No Shadow */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
                <div className="w-full px-6 py-4 md:py-5 flex items-center justify-between">

                    {/* Left: Brand */}
                    <Link href="/dashboard" className="flex items-center gap-4 group z-50 relative">
                        <div className="w-10 h-10 rounded-full bg-gray-900 group-hover:bg-black transition-colors flex items-center justify-center">
                            <span className="font-bold text-white text-xs tracking-tighter">FG</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 leading-none tracking-tight">OKUSANGA</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Regional Station</span>
                        </div>
                    </Link>

                    {/* Right: Actions & Menu Trigger */}
                    <div className="flex items-center gap-6 z-50 relative">
                        {/* Smart Search - Integrated in Header */}
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BUSCAR</span>
                            <input
                                type="text"
                                placeholder="Comando..."
                                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-32 focus:w-48 transition-all placeholder-gray-300"
                            />
                        </div>

                        {/* Menu Trigger Button (Hamburger Equivalent - Text Based) */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 group"
                        >
                            <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">
                                {isMenuOpen ? 'Fechar' : 'Menu'}
                            </span>
                            <div className="flex flex-col gap-1.5 p-2 transition-transform group-hover:scale-105">
                                <span className={cn("block w-6 h-0.5 bg-gray-900 transition-transform origin-center duration-300", isMenuOpen && "rotate-45 translate-y-2")}></span>
                                <span className={cn("block w-4 h-0.5 bg-gray-900 ml-auto transition-opacity duration-300", isMenuOpen && "opacity-0")}></span>
                                <span className={cn("block w-6 h-0.5 bg-gray-900 transition-transform origin-center duration-300", isMenuOpen && "-rotate-45 -translate-y-2")}></span>
                            </div>
                        </button>
                    </div>

                    {/* Full Screen Menu Overlay */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-0 left-0 w-full h-screen bg-white pt-24 px-6 md:px-20 pb-12 flex flex-col md:flex-row gap-12 overflow-y-auto"
                            >
                                {/* Navigation Links */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Navegação Principal</span>
                                    {menuItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={cn(
                                                "text-4xl md:text-6xl font-black tracking-tight hover:text-gray-900 transition-colors py-2 flex items-center gap-4 group",
                                                pathname === item.href ? "text-gray-900" : "text-gray-300"
                                            )}
                                        >
                                            {item.label}
                                            {item.badge && (
                                                <span className="text-xs align-top bg-red-500 text-white px-2 py-1 rounded-full font-bold -mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.badge} NOVOS
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>

                                {/* Menu Sidebar / User Context */}
                                <div className="w-full md:w-80 flex flex-col gap-8 md:pt-10 border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pl-12">

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Perfil Ativo</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">AD</div>
                                            <div>
                                                <div className="font-bold text-gray-900">Admin User</div>
                                                <div className="text-xs text-gray-500 font-medium">admin@geospace.gv.ao</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Sistema</h4>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm font-medium text-gray-600">
                                                <span>Versão</span>
                                                <span className="font-mono">v4.2.0</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm font-medium text-gray-600">
                                                <span>Status do Servidor</span>
                                                <span className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <button className="w-full py-4 text-center border-2 border-gray-100 hover:border-red-100 hover:bg-red-50 hover:text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all text-gray-400">
                                            Encerrar Sessão
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Spacer to prevent content overlap */}
            <div className="h-24 md:h-28 w-full"></div>
        </>
    );
};
