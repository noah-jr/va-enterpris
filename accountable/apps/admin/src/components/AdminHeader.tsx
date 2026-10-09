import * as React from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useAdminAuthStore } from '../stores/admin-auth.store.js';
import { GlobalSearch } from './header/GlobalSearch.js';
import { NotificationsMenu } from './header/NotificationsMenu.js';
import { MessagesButton } from './header/MessagesButton.js';
import { UserMenu } from './header/UserMenu.js';
import { useTheme } from '../hooks/useTheme.js';

interface AdminHeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-14 shrink-0 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3 px-4 sm:px-6 transition-colors">
      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        data-testid="mobile-menu-toggle"
        className="lg:hidden p-1.5 -ml-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="lg:hidden w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0">
        VA
      </div>

      <div className="flex-1 min-w-0 flex items-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          data-testid="theme-toggle"
          className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        <NotificationsMenu />
        {hasPermission('tickets:read') && <MessagesButton />}
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
        <UserMenu />
      </div>
    </header>
  );
};

