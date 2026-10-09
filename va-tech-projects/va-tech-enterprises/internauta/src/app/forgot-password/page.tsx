"use client";

import { useActionState, useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMessage("Verifique seu email para redefinir a senha.");
            } else {
                toast.error(data.error || "Erro ao processar");
            }
        } catch (error) {
            toast.error("Erro de conexão");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20">
                <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/50 rounded-[32px] p-8 shadow-2xl">
                    <div className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">Recuperar Conta</h1>
                            <p className="text-muted-foreground text-sm">Insira o seu email para receber o link de redefinição.</p>
                        </div>

                        {successMessage ? (
                            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-center space-y-4">
                                <p className="text-sm font-medium">{successMessage}</p>
                                <Link href="/login-internauta">
                                    <Button variant="outline" className="w-full">Voltar ao Login</Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Registado</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            required
                                            className="pl-10 h-11 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={isLoading}>
                                    {isLoading ? "A enviar..." : "Enviar Email de Recuperação"}
                                </Button>
                            </form>
                        )}

                        <div className="text-center pt-2">
                            <Link href="/login-internauta" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="w-3 h-3" />
                                Voltar ao login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
