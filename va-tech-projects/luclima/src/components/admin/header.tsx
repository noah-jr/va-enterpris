'use client';

import { Search, Bell, MessageSquare, Menu, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

interface AdminHeaderProps {
    onToggleSidebar: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    const { data: userData } = useQuery({
        queryKey: ['auth-me-header'],
        queryFn: async () => {
            if (!token) return null;
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!token,
    });

    const user = userData?.user;

    return (
        <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#080808] border-b border-gray-100 dark:border-gray-900">
            <div className="flex items-center justify-between px-6 py-4 uppercase">
                {/* Left: Mobile Menu & Search */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 -ml-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors lg:hidden rounded-none"
                        aria-label="Toggle Sidebar"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden md:flex items-center ml-2 border-l border-gray-100 dark:border-gray-800 pl-6">
                        <div className="relative">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="OPERATIONAL SEARCH..."
                                className="w-64 lg:w-96 pl-8 pr-4 bg-transparent text-[10px] font-black tracking-widest text-black dark:text-white focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-6">
                    <ThemeToggle />

                    <div className="relative h-10 w-[1px] bg-gray-100 dark:bg-gray-800" />

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-4 group focus:outline-none"
                        >
                            <div className="flex flex-col items-end hidden lg:block">
                                <span className="text-[10px] font-black text-black dark:text-white tracking-widest leading-none mb-1">
                                    {user?.name || 'ADMINISTRADOR'}
                                </span>
                                <span className="text-[8px] font-bold text-black tracking-[0.2em] leading-none">
                                    SYS OPERATOR
                                </span>
                            </div>
                            <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-black transition-all rounded-none">
                                <User className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                            </div>
                        </button>

                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-2xl z-50 py-0 animate-in fade-in slide-in-from-top-2 duration-200 rounded-none">
                                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] font-black text-black dark:text-white tracking-widest mb-1 truncate">
                                            {user?.name || 'ADMINISTRADOR'}
                                        </p>
                                        <p className="text-[9px] font-medium text-gray-500 tracking-widest truncate">
                                            {user?.email || 'ADMIN@LUCLIMA.COM'}
                                        </p>
                                    </div>
                                    <Link
                                        href="/admin/settings"
                                        className="block px-6 py-4 text-[10px] font-black tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black transition-all"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        ACCOUNT SETTINGS
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            await fetch('/api/auth/logout', { method: 'POST' });
                                            window.location.href = '/login';
                                        }}
                                        className="w-full text-left px-6 py-4 text-[10px] font-black tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center gap-3"
                                    >
                                        <LogOut size={14} />
                                        TERMINATE SESSION
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
