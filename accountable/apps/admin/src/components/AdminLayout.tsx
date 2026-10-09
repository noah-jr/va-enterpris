import * as React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Shield,
  History,
  HardDrive,
  Layers,
  Inbox,
  LifeBuoy,
  Bell,
  Settings,
  FileStack,
  KeyRound,
  CreditCard,
  Mail,
} from 'lucide-react';
import { useAdminAuthStore } from '../stores/admin-auth.store.js';
import { initialsFromEmail } from '../lib/relative-time.js';
import { AdminHeader } from './AdminHeader.js';

export const roleLabel = (role: string): string => {
  const map: Record<string, string> = {
    ADMINISTRATOR: 'Administrador',
    CONSULTANT: 'Consultor',
    SUPPORT: 'Suporte',
  };
  return map[role] ?? role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, ' ');
};

/** Marca "VA" no estilo original (quadrado escuro). */
export const BrandMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div
    aria-hidden="true"
    className={`${size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs'} rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold tracking-tight shadow-sm shrink-0`}
  >
    VA
  </div>
);

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, hasPermission } = useAdminAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navSections: { label: string; items: NavItem[] }[] = [
    {
      label: 'Operação',
      items: [
        { label: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Processos', path: '/documents', icon: FileCheck2 },
        { label: 'Clientes', path: '/clients', icon: Users },
        ...(hasPermission('tickets:read')
          ? [{ label: 'Tickets', path: '/tickets', icon: LifeBuoy }]
          : []),
        { label: 'Notificações', path: '/notifications', icon: Bell },
      ],
    },
    {
      label: 'Gestão',
      items: [
        ...(hasPermission('users:read')
          ? [
              { label: 'Utilizadores', path: '/users', icon: Shield },
              { label: 'Perfis & Permissões', path: '/roles', icon: KeyRound },
            ]
          : []),
        ...(hasPermission('subscriptions:read')
          ? [{ label: 'Subscrições', path: '/subscriptions', icon: CreditCard }]
          : []),
        ...(hasPermission('document_types:read')
          ? [{ label: 'Tipos de Documento', path: '/document-types', icon: FileStack }]
          : []),
        ...(hasPermission('plans:read')
          ? [{ label: 'Planos', path: '/plans', icon: Layers }]
          : []),
        ...(hasPermission('contacts:read')
          ? [{ label: 'Contactos', path: '/leads', icon: Inbox }]
          : []),
      ],
    },
    {
      label: 'Sistema',
      items: [
        ...(hasPermission('settings:manage')
          ? [{ label: 'Servidor de Email', path: '/settings?tab=email', icon: Mail }]
          : []),
        { label: 'Auditoria & Logs', path: '/audit', icon: History },
        { label: 'Backups', path: '/backups', icon: HardDrive },
      ],
    },
  ];

  const settingsItem: NavItem = { label: 'Definições', path: '/settings', icon: Settings };

  const isActive = (path: string) => {
    if (path.includes('?')) {
      const [basePath, search] = path.split('?');
      return location.pathname === basePath && location.search.includes(search ?? '');
    }
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/settings' && location.search.includes('tab=')) return false;
    return location.pathname.startsWith(path);
  };

  const renderLink = (item: NavItem, compact = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-2.5 ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'} rounded-lg text-xs font-medium transition-all duration-150 ${
          active
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/80'
        }`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {item.label}
      </Link>
    );
  };

  const renderSections = (compact = false) =>
    navSections.map((section) => (
      <div key={section.label}>
        <p className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-500 px-3 pt-4 pb-1 tracking-wider">{section.label}</p>
        <div className="space-y-0.5">{section.items.map((item) => renderLink(item, compact))}</div>
      </div>
    ));

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950 transition-colors">
      <aside className="hidden lg:flex w-60 flex-col bg-white dark:bg-[#09090b] border-r border-zinc-200/80 dark:border-zinc-800/80 p-3.5 shrink-0 sticky top-0 h-screen transition-colors">
        <div className="flex items-center gap-2.5 px-2.5 py-3 mb-2">
          <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
            VA
          </div>
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">VA OneGest</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono ml-auto">
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 pr-1">{renderSections()}</nav>

        <div className="pt-2 mt-2 space-y-2 border-t border-zinc-200/80 dark:border-zinc-800/60">
          {renderLink(settingsItem)}
          <Link
            to="/settings"
            className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-100/70 hover:bg-zinc-200/70 border border-zinc-200/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 dark:border-zinc-800/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 font-semibold text-[11px] shrink-0">
              {user ? initialsFromEmail(user.email) : ''}
            </div>
            <div className="truncate text-xs">
              <p className="font-medium text-zinc-900 dark:text-zinc-200 truncate">{user?.name || user?.email}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.roles.map(roleLabel).join(', ')}</p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-[#0c0c0e] transition-colors">
        <AdminHeader
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen((v) => !v)}
        />

        {isMobileMenuOpen && (
          <div className="lg:hidden sticky top-14 z-20 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 p-4 space-y-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {renderSections(true)}
            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">{renderLink(settingsItem, true)}</div>
          </div>
        )}

        <main className="flex-1 p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


