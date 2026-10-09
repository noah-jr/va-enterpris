"use client";

import { useActionState, useState, useRef } from "react";
import { Lock, User, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticateInternauta } from "@/lib/actions";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function InternautaLogin() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticateInternauta, undefined);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center bg-card/30 backdrop-blur-xl border border-border/50 rounded-[40px] overflow-hidden shadow-2xl">

                    {/* Visual Side */}
                    <div className="hidden lg:block relative h-full min-h-[600px]">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80 mix-blend-multiply" />
                        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                            <h2 className="text-4xl font-bold mb-4">Bem-vindo ao Clube VA Tech</h2>
                            <p className="text-lg opacity-90 leading-relaxed mb-8">
                                A sua conta pessoal para interagir com o nosso ecossistema. Comente artigos, guarde favoritos e acompanhe os seus projetos.
                            </p>
                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-sm border border-white/20">Interação Direta</div>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-sm border border-white/20">Premium UI</div>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="p-8 md:p-12">
                        <div className="max-w-md mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Área do Internauta</h1>
                                <p className="text-muted-foreground mt-2">Inicie sessão para aceder ao seu espaço exclusivo.</p>
                            </div>

                            <form action={dispatch} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                placeholder="seu@email.com"
                                                required
                                                className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="password">Palavra-passe</Label>
                                            <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">Esqueceu-se?</Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                placeholder="••••••••"
                                                required
                                                className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center py-2">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                                        onChange={(token) => setCaptchaToken(token)}
                                    />
                                </div>

                                <input type="hidden" name="captcha" value={captchaToken || ""} />

                                {errorMessage && (
                                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-foreground text-background hover:opacity-90 transition-all font-bold tracking-tight text-sm uppercase"
                                    disabled={isPending}
                                >
                                    {isPending ? "A verificar..." : "Entrar na Conta"}
                                </Button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-medium">Ou continuar com</span></div>
                                </div>

                                <SocialLoginButtons />
                            </form>

                            <div className="text-center space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Ainda não é membro? <Link href="/register-internauta" className="font-bold text-foreground hover:underline">Registar agora</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
