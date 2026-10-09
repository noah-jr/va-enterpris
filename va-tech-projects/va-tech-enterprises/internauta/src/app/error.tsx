"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center bg-background px-4 text-center">
            <div className="relative">
                <h1 className="text-9xl md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground/5 to-red-500/5 select-none leading-none">
                    Erro
                </h1>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 drop-shadow-sm">
                        Algo Deu Errado
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                        Encontramos um erro inesperado. Nossa equipe técnica foi notificada automaticamente.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={() => reset()}
                            className="bg-foreground text-background hover:opacity-90 rounded-full px-8 py-6 text-lg transition-all hover:scale-105"
                        >
                            Tentar Novamente
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="rounded-full px-8 py-6 text-lg border-border hover:bg-muted"
                        >
                            Voltar para Início
                        </Button>
                    </div>
                </div>
            </div>
            <div className="mt-20 text-sm text-gray-400 tracking-widest uppercase opacity-50">
                © {new Date().getFullYear()} VA TECH Enterprises
            </div>
        </div>
    );
}
