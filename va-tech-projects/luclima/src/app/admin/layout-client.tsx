'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
                <AdminHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
