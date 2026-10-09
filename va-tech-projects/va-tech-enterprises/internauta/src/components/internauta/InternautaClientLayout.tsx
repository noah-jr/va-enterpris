"use client";

import { useState } from "react";
import InternautaSidebar from "@/components/internauta/InternautaSidebar";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InternautaClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="bg-background text-foreground min-h-screen flex animate-in fade-in duration-1000 relative">
            {/* Sidebar with mobile logic */}
            <div className={cn(
                "fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-500",
                isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsSidebarOpen(false)} />

            <div className={cn(
                "fixed top-0 bottom-0 left-0 z-[70] transition-transform duration-500 ease-elastic lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <InternautaSidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/50 backdrop-blur-xl border-b border-border/20 z-40 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
                        <span className="text-background font-black text-sm">VA</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Portal</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 min-h-screen flex flex-col relative pt-16 lg:pt-0">
                {/* Optional glassmorphism background glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-foreground/[0.02] blur-[120px] rounded-full pointer-events-none" />

                <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full relative z-10">
                    {children}
                </div>

                <footer className="p-8 border-t border-border/20 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em]">VA TECH ENTERPRISES &bull; SECURE INTERNAUTA AREA</p>
                </footer>
            </main>
        </div>
    );
}
