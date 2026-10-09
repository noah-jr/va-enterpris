"use client";

import { Suspense, useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

function ResetPasswordForm({ token }: { token: string | null }) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!token) {
        return <div className="p-4 text-center text-red-500 font-bold">Token inválido ou expirado. Requira novo link.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("As palavras-passe não coincidem.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            if (res.ok) {
                toast.success("Senha redefinida com sucesso!");
                router.push("/login-internauta");
            } else {
                const data = await res.json();
                toast.error(data.error || "Erro ao redefinir senha");
            }
        } catch (error) {
            toast.error("Erro ao redefinir senha");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">Nova Palavra-passe</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 h-11 rounded-xl"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 h-11 rounded-xl"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={isLoading}>
                {isLoading ? "A redefinir..." : "Redefinir Palavra-passe"}
            </Button>
        </form>
    );
}

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") ?? null;
    return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20">
                <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/50 rounded-[32px] p-8 shadow-2xl">
                    <div className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">Nova Senha</h1>
                            <p className="text-muted-foreground text-sm">Defina uma nova senha segura para a sua conta.</p>
                        </div>
                        <Suspense fallback={<div className="text-center p-8">A carregar...</div>}>
                            <ResetPasswordContent />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}
