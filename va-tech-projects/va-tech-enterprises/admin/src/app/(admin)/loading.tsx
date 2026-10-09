import { Loader2 } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-foreground" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
                    Carregando dados...
                </p>
            </div>
        </div>
    );
}
