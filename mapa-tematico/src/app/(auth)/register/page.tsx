"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/lib/services/auth.service';
import { UserPlus, ChevronRight, ShieldCheck, ChevronLeft, AlertCircle, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastError } from '@/hooks/use-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [passError, setPassError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError(false);

        if (formData.password !== formData.confirmPassword) {
            setPassError(true);
            toastError('Erro de Validação', 'As chaves mestras não coincidem.');
            return;
        }

        if (!/[A-Z]/.test(formData.password)) {
            toastError('Senha Fraca', 'A chave mestra deve conter letra maiúscula.');
            return;
        }

        setIsLoading(true);

        try {
            await authService.register(formData);
            router.push('/dashboard');
        } catch (error) {
            console.error('Erro no registro:', error);
            // O interceptor do axios já mostra o toast de erro
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (name === 'confirmPassword' || name === 'password') {
            setPassError(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="w-full max-w-[480px]">
            {/* Header Terminal */}
            <div className="mb-8 flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 border border-primary/20 flex items-center justify-center relative group mb-6"
                >
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <UserPlus className="w-8 h-8 text-primary relative z-10" />
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
                    REGISTRO_SYS
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="flex items-center gap-2"
                >
                    <span className="h-px w-4 bg-primary" />
                    <span className="text-[10px] font-tactical uppercase tracking-widest text-foreground">Provisionamento de Operador</span>
                    <span className="h-px w-4 bg-primary" />
                </motion.div>
            </div>

            {/* Tactical Card */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="tactical-panel p-8 bg-card/50 backdrop-blur-md border border-border/50 relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Protocolo de Inscrição</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-primary animate-pulse" />
                        <span className="text-[8px] font-tactical opacity-30">SEC_MODE: ON</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary/20" />
                                Nome_Operacional
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-background/50 border border-border/80 h-11 px-4 text-xs font-medium focus:border-primary focus:bg-background/80 transition-all outline-none tactical-input"
                                placeholder="NOME COMPLETO"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary/20" />
                                Canal_Comms
                            </label>
                            <input
                                name="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-background/50 border border-border/80 h-11 px-4 text-xs font-medium focus:border-primary focus:bg-background/80 transition-all outline-none tactical-input"
                                placeholder="+244..."
                                disabled={isLoading}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                            <Fingerprint className="w-3 h-3 text-primary/40" />
                            Identificador_Web
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background/50 border border-border/80 h-11 px-4 text-xs font-medium focus:border-primary focus:bg-background/80 transition-all outline-none tactical-input"
                            placeholder="OPERADOR@GEOSPACE.GOV.AO"
                            disabled={isLoading}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chave_Mestra</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
                                className={cn(
                                    "w-full bg-background/50 border h-11 px-4 text-xs font-medium transition-all outline-none tactical-input",
                                    passError ? "border-red-500/50 focus:border-red-500" : "border-border/80 focus:border-primary"
                                )}
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirmar_Chave</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={8}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={cn(
                                    "w-full bg-background/50 border h-11 px-4 text-xs font-medium transition-all outline-none tactical-input",
                                    passError ? "border-red-500/50 focus:border-red-500" : "border-border/80 focus:border-primary"
                                )}
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                    </motion.div>

                    {passError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-wider"
                        >
                            <AlertCircle className="w-3 h-3" />
                            As senhas fornecidas não são idênticas
                        </motion.div>
                    )}

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
                                <span className="opacity-70">VALIDANDO_ACESSO...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3 h-3" />
                                <span>SOLICITAR_CREDENCIAL</span>
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
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Já possui autorização?</span>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-foreground transition-all group"
                        >
                            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            RETORNAR_LOGIN
                        </Link>
                    </div>
                </motion.div>
            </motion.div>

            {/* Footer Decal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ delay: 1 }}
                className="mt-6 flex justify-between items-center px-2"
            >
                <span className="text-[6px] font-black uppercase tracking-widest">Sys_Ver: 1.0.42_GEOSPACE</span>
                <div className="flex gap-2">
                    <div className="w-1 h-1 bg-white" />
                    <div className="w-1 h-1 bg-white" />
                    <div className="w-1 h-1 bg-white opacity-20" />
                </div>
            </motion.div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
