"use client";

import { useState } from 'react';
import Link from 'next/link';
import authService from '@/lib/services/auth.service';
import { KeyRound, ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.forgotPassword({ email });
            setEmailSent(true);
        } catch (error) {
            console.error('Erro ao solicitar recuperação:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="w-full max-w-[400px]">
                <div className="tactical-panel p-8 bg-card/50 backdrop-blur-md text-center">
                    <div className="w-16 h-16 border border-primary/20 flex items-center justify-center relative mx-auto mb-6">
                        <div className="absolute inset-0 bg-primary/5" />
                        <CheckCircle2 className="w-8 h-8 text-primary relative z-10" />
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary" />
                    </div>

                    <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-4">Link_Enviado</h2>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed mb-8">
                        Instruções de recuperação transmitidas para <br />
                        <span className="text-primary font-bold">{email}</span>
                    </p>

                    <Link
                        href="/login"
                        className="w-full tactical-btn-primary flex items-center gap-2"
                    >
                        <ChevronLeft className="w-3 h-3" />
                        RETORNAR_LOGIN
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[400px]">
            {/* Header Terminal */}
            <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 border border-primary/20 flex items-center justify-center relative group mb-6">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <KeyRound className="w-8 h-8 text-primary relative z-10" />
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary" />
                </div>

                <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-foreground mb-1">RESET_CHAVE</h1>
                <div className="flex items-center gap-2">
                    <span className="h-px w-4 bg-primary/30" />
                    <span className="text-[10px] font-tactical uppercase tracking-widest text-muted-foreground">Recuperação de Acesso</span>
                    <span className="h-px w-4 bg-primary/30" />
                </div>
            </div>

            {/* Tactical Card */}
            <div className="tactical-panel p-8 bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-8">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Recuperação</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email_Cadastrado</label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background/50 border border-border h-11 px-4 text-xs font-medium focus:border-primary transition-colors outline-none"
                            placeholder="OPERADOR@GEOSPACE.GOV.AO"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full tactical-btn-primary group"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-current animate-pulse" />
                                <span className="animate-pulse">TRANSMITINDO...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>ENVIAR_INSTRUÇÕES</span>
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-8 flex flex-col items-center">
                    <Link
                        href="/login"
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3" />
                        CANCELAR_OPERACAO
                    </Link>
                </div>
            </div>
        </div>
    );
}
