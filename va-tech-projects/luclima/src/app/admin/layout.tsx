import type { Metadata } from 'next';
import { AdminLayoutClient } from './layout-client';

export const metadata: Metadata = {
    title: 'Painel Administrativo - Luclima',
    description: 'Sistema de Gestão de Climatização e Serviços',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
