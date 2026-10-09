"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/lib/services/auth.service';
import socketService from '@/lib/socket';
import { LogIn, ShieldAlert, ChevronRight, Fingerprint, ChevronLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authService.login(formData);
            socketService.connect({ token: response.accessToken });
            router.push('/dashboard');
        } catch (error) {
            console.error('Erro no login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Header Terminal */}
            <div className="mb-8 flex flex-col items-center w-full max-w-[620px]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 border border-primary/20 flex items-center justify-center relative group mb-6"
                >
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <ShieldAlert className="w-8 h-8 text-primary relative z-10" />
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary" />

                    {/* Scanning Animation */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ top: 0 }}
                                animate={{ top: '100%' }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-primary/40 z-20"
                            />
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black uppercase tracking-[0.2em] text-foreground mb-1"
                >
                    GEOSPACE_Admin
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="flex items-center gap-2"
                >
                    <span className="h-px w-4 bg-primary" />
                    <span className="text-[10px] font-tactical uppercase tracking-widest text-foreground">Console de Autenticação</span>
                    <span className="h-px w-4 bg-primary" />
                </motion.div>
            </div>

            {/* Tactical Card */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="tactical-panel p-10 bg-card/50 backdrop-blur-md border border-border/50 relative overflow-hidden w-full max-w-[620px]"
            >
                {/* Background Decoration */}
                <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Verificação de Credenciais</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants} className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                            <span className="w-1 h-3 bg-primary/20" />
                            Identificador_Web
                        </label>
                        <input
                            name="email"
                            type="text"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background/50 border border-border/80 h-11 px-4 text-xs font-medium focus:border-primary focus:bg-background/80 transition-all outline-none tactical-input"
                            placeholder="OPERADOR@GEOSPACE.GOV.AO OU +244..."
                            disabled={isLoading}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Lock className="w-3 h-3 text-primary/40" />
                                Chave_Segurança
                            </label>
                            <Link href="/forgot-password" className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors">Recuperar_Chave</Link>
                        </div>
                        <input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-background/50 border border-border/80 h-11 px-4 text-xs font-medium focus:border-primary focus:bg-background/80 transition-all outline-none tactical-input"
                            placeholder="••••••••••••"
                            disabled={isLoading}
                        />
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] relative overflow-hidden group disabled:opacity-50 transition-all"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                                <span className="opacity-70">SINC_DATABASE...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <LogIn className="w-3 h-3" />
                                <span>EXECUTAR_LOGIN</span>
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </motion.button>
                </form>

                <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-5">
                    <div className="w-full h-px bg-border/20 relative">
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-3 text-[7px] font-black text-muted-foreground uppercase tracking-[0.4em]">OU</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Sem autorização prévia?</span>
                        <Link
                            href="/register"
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-foreground transition-all group"
                        >
                            Solicitar_Acesso.sys
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </motion.div>

            {/* Terminal Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.5 }}
                className="mt-8 grid grid-cols-2 gap-4 px-2"
            >
                <div className="flex flex-col gap-0.5 text-left border-l border-primary/20 pl-4">
                    <span className="text-[6px] font-black uppercase tracking-widest opacity-60">Nível_Sessão</span>
                    <span className="text-[8px] font-tactical font-black">L0_UNAUTHENTICATED</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right border-r border-primary/20 pr-4">
                    <span className="text-[6px] font-black uppercase tracking-widest opacity-60">Protocolo_Sync</span>
                    <span className="text-[8px] font-tactical font-black text-primary">ACTIVE</span>
                </div>
            </motion.div>
        </div>
    );
}
