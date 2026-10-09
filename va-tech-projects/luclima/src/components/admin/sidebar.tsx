'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Wrench,
    FileText,
    Mail,
    MessageSquare,
    Settings,
    LogOut,
    Building2,
    Database,
    File,
    BarChart,
    X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Utilizadores', href: '/admin/users', icon: Users },
    { name: 'Sectores', href: '/admin/sectors', icon: Building2 },
    { name: 'Serviços', href: '/admin/services', icon: Wrench },
    { name: 'Projectos', href: '/admin/projects', icon: Briefcase },
    { name: 'Pedidos de Serviço', href: '/admin/service-requests', icon: FileText },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { name: 'Contactos', href: '/admin/contacts', icon: MessageSquare },
    { name: 'Ficheiros', href: '/admin/files', icon: File },
    { name: 'Relatórios', href: '/admin/reports', icon: BarChart },
    { name: 'Base de Dados', href: '/admin/backup', icon: Database },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
    { name: 'Portal Internauta', href: '/internauta', icon: MessageSquare },
];

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Sidebar Drawer */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-[#080808] border-r border-gray-200 dark:border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 font-sans`}
            >
                <div className="flex flex-col h-full uppercase">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between">
                        <Logo href="/admin" className="scale-110 origin-left" />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden rounded-none"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto pt-6 custom-scrollbar">
                        <div className="px-6 mb-4 text-[10px] font-black text-black tracking-[0.3em] italic">Main Control</div>
                        <ul className="space-y-0.5">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center space-x-4 px-8 py-4 border-l-4 transition-all ${isActive
                                                ? 'bg-black/5 border-black text-black dark:text-gray-900 font-black'
                                                : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 font-bold'
                                                }`}
                                        >
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                            <span className="text-[11px] tracking-widest">{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-900 space-y-4">
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] font-black text-gray-400 tracking-widest">Interface</span>
                            <ThemeToggle />
                        </div>
                        <button
                            onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = '/login';
                            }}
                            className="w-full flex items-center justify-center space-x-3 px-6 py-5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] tracking-[0.3em]"
                        >
                            <LogOut size={18} />
                            <span>System Exit</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
