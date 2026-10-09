"use client";

import { useActionState } from "react";
import { Lock, User, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerInternauta } from "@/lib/actions";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function InternautaRegister() {
    const [errorMessage, dispatch, isPending] = useActionState(registerInternauta, undefined);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center bg-card/30 backdrop-blur-xl border border-border/50 rounded-[40px] overflow-hidden shadow-2xl">

                    {/* Visual Side */}
                    <div className="hidden lg:block relative h-full min-h-[600px]">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/80 to-primary/80 mix-blend-multiply" />
                        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                            <h2 className="text-4xl font-bold mb-4">Junte-se à nossa Comunidade</h2>
                            <p className="text-lg opacity-90 leading-relaxed mb-8">
                                Crie o seu perfil personalizado em poucos segundos. Tenha acesso a conteúdos exclusivos e interaja diretamente com a nossa tecnologia.
                            </p>
                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-sm border border-white/20">Registo Rápido</div>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-sm border border-white/20">Acesso Total</div>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="p-8 md:p-12">
                        <div className="max-w-md mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Criar Conta</h1>
                                <p className="text-muted-foreground mt-2">Torne-se um Internauta oficial da VA Tech.</p>
                            </div>

                            <form action={dispatch} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Nome</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="firstName" name="firstName" placeholder="João" required className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Sobrenome</Label>
                                        <Input id="lastName" name="lastName" placeholder="Silva" required className="h-10 rounded-xl bg-muted/50 border-border/50" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" type="email" name="email" placeholder="seu@email.com" required className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Palavra-passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="password" type="password" name="password" placeholder="Mínimo 6 caracteres" required className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50" />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        name="newsletter"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label
                                        htmlFor="newsletter"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Quero receber novidades e promoções exclusivas da VA Tech.
                                    </label>
                                </div>

                                {errorMessage && (
                                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 mt-4 rounded-xl bg-foreground text-background hover:opacity-90 transition-all font-semibold"
                                    disabled={isPending}
                                >
                                    {isPending ? "A processar..." : "Registar Agora"}
                                </Button>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-medium">Ou registar com</span></div>
                                </div>

                                <SocialLoginButtons />

                                <p className="text-center text-sm text-muted-foreground mt-6">
                                    Já tem uma conta? <Link href="/login-internauta" className="text-primary font-medium hover:underline">Entre aqui</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
