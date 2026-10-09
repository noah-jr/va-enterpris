
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMe } from "../auth/useAuth";
import { themeStore } from "../store/themeStore";
import DesktopControls from "../components/DesktopControls";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { MobileNav } from "../components/MobileNav";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(themeStore.getTheme());
    const { data: user } = useMe();
    const location = useLocation();

    const isSaaSClient = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'USER';
    const enabledModules = user?.company?.enabledModules ?? (user as any)?.enabledModules ?? [];
    const isRestricted =
        isSaaSClient &&
        (enabledModules.length === 0 || !(user as any)?.hasActiveSubscription) &&
        location.pathname !== '/subscription' &&
        location.pathname !== '/';

    useEffect(() => { themeStore.init(); }, []);

    const handleToggleTheme = () => {
        const next = themeStore.toggleTheme();
        setTheme(next);
    };

    const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');

    return (
        <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden flex-col">
            {isElectron && (
                <div className="h-8 drag flex items-center justify-between bg-[var(--bg-secondary)] border-b border-[var(--border-color)] z-[2000] w-full shrink-0">
                    <div className="px-4 text-[10px] text-[var(--text-muted)]">VA Onegest</div>
                    <DesktopControls />
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex h-full transition-all duration-300 ease-in-out" style={{ width: isSidebarCollapsed ? '64px' : 'var(--sidebar-width)' }}>
                    <Sidebar isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Mobile Sidebar overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-[1000] flex md:hidden">
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="relative z-10 animate-fade-in shadow-[var(--shadow-lg)]">
                            <Sidebar onClose={() => setMobileMenuOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Main area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <Header
                        onMenuOpen={() => setMobileMenuOpen(true)}
                        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        isSidebarCollapsed={isSidebarCollapsed}
                        toggleTheme={handleToggleTheme}
                        theme={theme}
                    />

                    <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)] pb-[calc(60px+env(safe-area-inset-bottom,0px))] md:pb-0">
                        {isRestricted ? (
                            <div className="h-full flex items-center justify-center p-8 animate-fade-in">
                                <div className="premium-card p-10 max-w-md w-full text-center space-y-6">
                                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-base font-600 text-[var(--text-primary)]">Subscrição inativa</h2>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            A sua conta não tem uma subscrição ativa. Ative um plano para aceder a todos os módulos.
                                        </p>
                                    </div>
                                    <Link to="/subscription" className="premium-button-primary inline-flex">
                                        Ver planos
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 md:p-6 w-full max-w-[1600px] mx-auto animate-fade-in">
                                {children}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <MobileNav onMenuOpen={() => setMobileMenuOpen(true)} />
        </div>
    );
};

export { Layout };