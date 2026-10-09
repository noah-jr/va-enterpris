import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center p-8 bg-white dark:bg-card rounded-[20px] shadow-sm m-4">
            <div className="bg-gray-50 dark:bg-foreground p-6 rounded-full mb-6">
                <HelpCircle className="h-16 w-16 text-gray-400 dark:text-gray-300" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-2">
                Página não encontrada
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                A rota solicitada não existe ou foi movida. Verifique o endereço ou use o menu lateral para navegar.
            </p>
            <Link href="/">
                <Button className="bg-foreground hover:bg-foreground/90 dark:bg-foreground dark:hover:bg-foreground text-white rounded-xl px-8 py-3 font-medium transition-all shadow-lg shadow-foreground/20 hover:shadow-foreground/40">
                    Voltar ao Dashboard
                </Button>
            </Link>
        </div>
    );
}
