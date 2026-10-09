import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold tracking-widest animate-pulse text-foreground">
                    VA TECH
                </h1>
                <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase font-medium">
                    Enterprises
                </p>
                <Loader2 className="h-8 w-8 animate-spin text-foreground mt-4" />
            </div>
        </div>
    );
}
