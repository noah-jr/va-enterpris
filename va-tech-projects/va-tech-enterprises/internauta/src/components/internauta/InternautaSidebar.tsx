"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    MessageSquare,
    Heart,
    Settings,
    LogOut,
    ExternalLink,
    Compass
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logOut } from "@/lib/actions";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/internauta/dashboard" },
    { icon: MessageSquare, label: "Interações", href: "/internauta/activity" },
    { icon: Heart, label: "Favoritos", href: "/internauta/favorites" },
    { icon: Settings, label: "Definições", href: "/internauta/settings" },
];

export default function InternautaSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    return (
        <aside className="w-64 lg:w-72 bg-card/30 backdrop-blur-xl border-r border-border/40 flex flex-col h-screen lg:static fixed left-0 top-0 z-50 overflow-y-auto custom-scrollbar">
            {/* Logo Section */}
            <div className="p-8 pb-12">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <span className="text-background font-black text-xl">VA</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tighter uppercase line-clamp-1">Espaço Internauta</h2>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Portal de Vantagens</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                <div className="mb-4 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Menu Principal</div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                                isActive
                                    ? "bg-foreground text-background shadow-xl shadow-foreground/10"
                                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-background" : "group-hover:scale-110 transition-transform")} />
                            <span className="text-sm font-semibold">{item.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-background" />}
                        </Link>
                    );
                })}

                <div className="pt-8 mb-4 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Recursos Externos</div>
                <Link
                    href="/blog"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                    <Compass className="w-5 h-5" />
                    <span className="text-sm font-semibold">Explorar Blog</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
                </Link>
            </nav>

            {/* Footer / Logout */}
            <div className="p-6 mt-auto">
                <div className="p-4 rounded-3xl bg-muted/20 border border-border/40 mb-6">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Suporte Prioritário</p>
                    <p className="text-xs text-foreground font-bold">Precisa de ajuda? Fale connosco via dashboard.</p>
                </div>

                <form action={logOut}>
                    <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-500 font-bold text-sm">
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">VA Tech © 2026</p>
                </div>
            </div>
        </aside>
    );
}
