"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, LayoutDashboard, Menu, X, LogIn, UserPlus, Calendar, Ticket } from "lucide-react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Eventos", href: "/eventos", icon: Calendar },
        { name: "Blog", href: "/blog", icon: Ticket },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${scrolled
                ? "py-4 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5"
                : "py-6 bg-transparent"
            }`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="group">
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        VA<span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent group-hover:from-pink-500 group-hover:to-purple-500 transition-all">EVENTS</span>
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <ul className="hidden lg:flex gap-8 items-center">
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <Link
                                href={link.href}
                                className="flex items-center gap-2 text-gray-400 hover:text-white font-bold transition-colors group"
                            >
                                <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Auth Buttons */}
                <div className="flex gap-4 items-center">
                    {user ? (
                        <div className="hidden lg:flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Minha Área
                            </Link>
                            <button
                                onClick={logout}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all text-gray-400"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-4">
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold hover:bg-white/5 transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                Entrar
                            </Link>
                            <Link
                                href="/registro"
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <UserPlus className="w-4 h-4" />
                                Registar
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-[#121212] border-t border-white/5 overflow-hidden"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {/* Navigation Links */}
                            <ul className="space-y-4">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <link.icon className="w-5 h-5" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Auth Buttons */}
                            <div className="pt-6 border-t border-white/5 space-y-3">
                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold w-full"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            Minha Área
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold w-full"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sair
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-bold bg-white/5 border border-white/10 w-full"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <LogIn className="w-5 h-5" />
                                            Entrar
                                        </Link>
                                        <Link
                                            href="/registro"
                                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold w-full"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <UserPlus className="w-5 h-5" />
                                            Registar
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

