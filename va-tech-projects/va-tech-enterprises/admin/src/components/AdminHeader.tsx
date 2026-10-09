"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, Search, Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserDropdown from "./UserDropdown";
import NotificationsDropdown from "./NotificationsDropdown";
import MessagesDropdown from "./MessagesDropdown";
import ThemeToggle from "./ThemeToggle";

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const [notificationCount, setNotificationCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (term: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams?.toString());
            params.set("page", "1");
            if (term) {
                params.set("q", term);
            } else {
                params.delete("q");
            }
            replace(`${pathname}?${params.toString()}`);
        }, 300);
    };

    // Get current page name from path
    const getPageName = (path: string) => {
        if (path === "/") return "Painel Geral";
        if (path.includes("/posts")) {
            if (path.includes("/edit")) return "Editar Artigo";
            if (path.includes("/new")) return "Novo Artigo";
            return "Blog & Notícias";
        }
        if (path.includes("/internautas")) return "Gestão de Internautas";
        if (path.includes("/newsletter")) return "Newsletter & Marketing";
        if (path.includes("/contacts")) return "Contactos Recebidos";
        if (path.includes("/settings")) return "Configurações";
        if (path.includes("/users")) return "Utilizadores";
        if (path.includes("/services")) return "Serviços & Soluções";
        if (path.includes("/projects")) return "Portfólio de Projetos";

        const segment = path.split("/")[1];
        if (!segment) return "Administração";
        return segment.charAt(0).toUpperCase() + segment.slice(1).split('/')[0].replace("-", " ");
    };

    const pageName = getPageName(pathname || "");

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch notifications and messages count
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [notifRes, msgRes] = await Promise.all([
                    fetch("/api/notifications/count"),
                    fetch("/api/messages/count"),
                ]);

                if (notifRes.ok) {
                    const { count } = await notifRes.json();
                    setNotificationCount(count);
                }

                if (msgRes.ok) {
                    const { count } = await msgRes.json();
                    setMessageCount(count);
                }
            } catch (error) {
                console.error("Error fetching counts:", error);
            }
        };

        fetchCounts();

        // Poll every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav
            className={`sticky top-4 z-40 mx-4 mt-4 flex flex-row flex-wrap items-center justify-between rounded-xl p-2 transition-all duration-300 md:mx-6 md:p-4 ${scrolled
                ? "bg-white/30 backdrop-blur-xl shadow-lg shadow-gray-500/5 dark:bg-background/80"
                : "bg-none"
                }`}
        >
            <div className="ml-[6px]">
                <div className="h-6 w-[224px] pt-1">
                    <a
                        className="text-sm font-normal text-foreground hover:underline dark:text-white dark:hover:text-white"
                        href="/"
                    >
                        Páginas
                        <span className="mx-1 text-sm text-foreground hover:text-foreground dark:text-white">
                            {" "}
                            /{" "}
                        </span>
                    </a>
                    <a
                        className="text-sm font-normal capitalize text-foreground hover:underline dark:text-white dark:hover:text-white"
                        href="#"
                    >
                        {pageName}
                    </a>
                </div>
                <p className="shrink text-[33px] capitalize text-foreground dark:text-white">
                    <span className="font-bold text-foreground dark:text-white">
                        {pageName}
                    </span>
                </p>
            </div>

            <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:bg-card border dark:border-border dark:shadow-none md:w-[565px] md:flex-grow-0 md:gap-1 xl:w-[565px] xl:gap-2">
                <div className="flex h-full items-center rounded-full bg-gray-100 text-foreground dark:bg-muted dark:text-foreground xl:w-[425px]">
                    <p className="pl-3 pr-2 text-xl">
                        <Search className="h-4 w-4 text-gray-400 dark:text-white" />
                    </p>
                    <Input
                        type="text"
                        placeholder="Pesquisar..."
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams?.get("q")?.toString()}
                        className="block h-full w-full rounded-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:!text-gray-400 dark:bg-transparent dark:text-white dark:placeholder:!text-white sm:w-fit border-none focus-visible:ring-0 md:w-full"
                    />
                </div>

                {/* Mobile Menu Toggle */}
                <span
                    className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </span>

                {/* Notifications */}
                <NotificationsDropdown
                    count={notificationCount}
                    onCountChange={setNotificationCount}
                />

                {/* Messages */}
                <MessagesDropdown
                    count={messageCount}
                    onCountChange={setMessageCount}
                />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Profile */}
                <UserDropdown />
            </div>
        </nav>
    );
}

