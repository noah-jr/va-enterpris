"use client";

import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Mail,
    Users,
    Settings,
    LogOut,
    X,
    Newspaper,
    Database,
    Folder,
    Layers,
    UserCheck,
    MessageCircle,
    LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { logOut } from "@/lib/actions";
import AdminHeader from "@/components/AdminHeader";

import { hasPermission } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface SidebarItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

const sidebarItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Briefcase, label: "Serviços", href: "/services" },
    { icon: Layers, label: "Portfólio", href: "/projects" },
    { icon: FileText, label: "Blog & Notícias", href: "/posts" },
    { icon: UserCheck, label: "Equipa", href: "/team" },
    { icon: MessageCircle, label: "Testemunhos", href: "/testimonials" },
    { icon: Users, label: "Parceiros", href: "/partners" },
    { icon: Users, label: "Internautas", href: "/internautas" },
    { icon: Mail, label: "Contactos", href: "/contacts" },
    { icon: MessageCircle, label: "Mensagens", href: "/messages" },
    { icon: LayoutGrid, label: "Sectores", href: "/sectors" },
    { icon: Newspaper, label: "Newsletter", href: "/newsletter" },
    { icon: FileText, label: "Documentos", href: "/contracts" },
    { icon: Users, label: "Utilizadores", href: "/users" },
    { icon: Folder, label: "Arquivos", href: "/files" },
    { icon: Database, label: "Backups", href: "/backup" },
    { icon: Settings, label: "Configurações", href: "/settings" },
];

export default function AdminClientLayout({
    children,
    userRole
}: {
    children: React.ReactNode;
    userRole: string | null;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const error = searchParams?.get("error");
        if (error === "Unauthorized") {
            toast({
                title: "Acesso Negado",
                description: "Você não tem permissão para aceder a esta área.",
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

    const filteredSidebarItems = sidebarItems.filter(item =>
        hasPermission(userRole, item.href)
    );



    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-background text-foreground">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-card border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none",
                    "w-64 xl:w-[290px]"
                )}
            >
                {/* Logo area */}
                <div className="flex h-28 items-center justify-center border-b-[1px] border-gray-100 dark:border-gray-800 lg:border-none my-4 mx-8 relative">
                    <Link href="/" className="relative h-24 w-48 transition-opacity hover:opacity-80">
                        <Image
                            src="/logo-light.png"
                            alt="VA TECH Logo"
                            fill
                            className="object-contain dark:hidden "
                            priority
                        />
                        <Image
                            src="/logo-dark.png"
                            alt="VA TECH Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </Link>

                    {/* Mobile Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-8 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Separator line */}
                <div className="h-px bg-gray-200 dark:bg-white/10 mx-8 mb-6" />

                {/* Navigation */}
                <ScrollArea className="flex-1 px-4">
                    <nav className="space-y-1 mb-8">
                        {filteredSidebarItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <div className="relative mb-3 flex hover:cursor-pointer">
                                        <li className="my-[3px] flex cursor-pointer items-center px-8" key={item.label}>
                                            <span className={cn(
                                                "font-bold",
                                                isActive ? "text-primary dark:text-white" : "text-gray-400 dark:text-gray-400"
                                            )}>
                                                <item.icon className="h-5 w-5" />
                                            </span>
                                            <span className={cn(
                                                "ml-4 flex text-base font-medium",
                                                isActive ? "text-primary dark:text-white font-bold" : "text-gray-400 dark:text-gray-400"
                                            )}>
                                                {item.label}
                                            </span>
                                        </li>
                                        {isActive && (
                                            <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-primary dark:bg-white" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Section */}
                    <div className="px-8 mt-auto mb-4">
                        <form action={logOut}>
                            <div className="relative mb-3 flex hover:cursor-pointer group">
                                <button className="my-[3px] flex cursor-pointer items-center w-full">
                                    <span className="font-bold text-[#A3AED0] group-hover:text-red-500 transition-colors">
                                        <LogOut className="h-5 w-5" />
                                    </span>
                                    <span className="ml-4 flex text-base font-medium text-[#A3AED0] group-hover:text-red-500 transition-colors">
                                        Sair
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Small Copyright */}
                        <div className="mt-8 text-xs text-[#A3AED0] text-center">
                            © 2026 Admin Panel
                        </div>
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-background">
                {/* Header */}
                <Suspense fallback={<div className="h-20" />}>
                    <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
                </Suspense>

                {/* Page Content */}
                <main className="mx-auto h-full w-full p-4 md:p-8 mb-auto overflow-y-auto">
                    <div className="min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
