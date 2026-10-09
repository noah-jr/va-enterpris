import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  LifeBuoy,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@accountable/ui';
import { ClientNotificationsMenu } from './ClientNotificationsMenu.js';
import { ClientUserMenu } from './ClientUserMenu.js';
import { useTheme } from '../../hooks/useTheme.js';

interface ClientHeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') {
      return {
        section: 'Portal',
        icon: LayoutDashboard,
        current: 'Visão Geral',
      };
    }
    if (path === '/documents/new') {
      return {
        section: 'Processos',
        icon: FileText,
        parentPath: '/documents',
        current: 'Novo Processo',
      };
    }
    if (path.startsWith('/documents/')) {
      return {
        section: 'Processos',
        icon: FileText,
        parentPath: '/documents',
        current: 'Detalhes do Processo',
      };
    }
    if (path === '/documents') {
      return {
        section: 'Processos',
        icon: FileText,
        current: 'Meus Documentos',
      };
    }
    if (path === '/tickets/new') {
      return {
        section: 'Suporte',
        icon: LifeBuoy,
        parentPath: '/tickets',
        current: 'Novo Ticket',
      };
    }
    if (path.startsWith('/tickets/')) {
      return {
        section: 'Suporte',
        icon: LifeBuoy,
        parentPath: '/tickets',
        current: 'Detalhes do Ticket',
      };
    }
    if (path === '/tickets') {
      return {
        section: 'Suporte',
        icon: LifeBuoy,
        current: 'Atendimento & Pedidos',
      };
    }
    if (path === '/notifications') {
      return {
        section: 'Central',
        icon: Bell,
        current: 'Notificações',
      };
    }
    return {
      section: 'Portal',
      icon: LayoutDashboard,
      current: 'Visão Geral',
    };
  };

  const breadcrumb = getBreadcrumb();
  const Icon = breadcrumb.icon;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
            <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            {breadcrumb.parentPath ? (
              <Link
                to={breadcrumb.parentPath}
                className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {breadcrumb.section}
              </Link>
            ) : (
              <span>{breadcrumb.section}</span>
            )}
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-none">
            {breadcrumb.current}
          </span>
        </div>
      </div>

      {/* Right: Theme switch, quick actions, notifications, user */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Security badge pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Ligação segura</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          data-testid="theme-toggle"
          className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* Action Button */}
        {location.pathname !== '/documents/new' && (
          <Link to="/documents/new" className="hidden sm:inline-flex">
            <Button size="sm" variant="primary" className="gap-1.5 text-xs py-1 px-3 h-8">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Processo</span>
            </Button>
          </Link>
        )}

        {/* Notifications Dropdown */}
        <ClientNotificationsMenu />

        {/* User Dropdown */}
        <div className="pl-1 border-l border-zinc-200/80 dark:border-zinc-800/80">
          <ClientUserMenu />
        </div>
      </div>
    </header>
  );
};

