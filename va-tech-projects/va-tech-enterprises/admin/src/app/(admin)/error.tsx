"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center p-8 bg-white dark:bg-card rounded-[20px] shadow-sm m-4 border border-red-100 dark:border-red-900/30">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6 text-red-500 dark:text-red-400 animate-in zoom-in duration-300">
                <AlertTriangle className="h-16 w-16" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-2">
                Erro no Painel Administrativo
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Um erro inesperado interrompeu a operação. Tente recarregar a página ou entre em contato com o suporte técnico se o problema persistir.
            </p>

            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-foreground hover:bg-foreground/90 dark:bg-foreground dark:hover:bg-foreground text-white rounded-xl px-6 py-3 font-medium transition-all shadow-lg shadow-foreground/20 hover:shadow-foreground/40"
                >
                    Tentar Novamente
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="rounded-xl px-6 py-3 font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-foreground"
                >
                    Recarregar Página
                </Button>
            </div>

            <div className="mt-8 w-full max-w-lg">
                <details className="text-left cursor-pointer group">
                    <summary className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors list-none text-center select-none">
                        <span className="border-b border-dashed border-gray-300 dark:border-gray-700 pb-0.5">Ver detalhes técnicos</span>
                    </summary>
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-background rounded-xl border border-gray-100 dark:border-foreground overflow-hidden animate-in slide-in-from-top-2">
                        <p className="font-mono text-xs text-red-500 break-words whitespace-pre-wrap">
                            {error.message || "Erro desconhecido"}
                        </p>
                        {error.digest && (
                            <p className="font-mono text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-card">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                </details>
            </div>
        </div>
    );
}
