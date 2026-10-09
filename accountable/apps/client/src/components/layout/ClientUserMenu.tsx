import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Building2,
  FileText,
  LifeBuoy,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store.js';
import { authService } from '../../services/auth.service.js';

export const ClientUserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { client, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate('/auth/login');
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const initials = client?.name
    ? client.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    : 'CL';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 transition-all focus:outline-none"
        aria-label="Menu do Utilizador"
      >
        <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs flex items-center justify-center shadow-xs">
          {initials}
        </div>
        <div className="hidden sm:block text-left leading-none">
          <p className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate max-w-[130px]">
            {client?.name || 'Cliente'}
          </p>
          <p className="text-[10px] text-subtle truncate mt-0.5">
            {client?.nip ? `NIP ${client.nip}` : client?.company || 'Empresa'}
          </p>
        </div>
        <ChevronDown className="hidden sm:block w-3 h-3 text-subtle" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User Details */}
          <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {client?.name || 'Cliente Accountable'}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{client?.email || '-'}</p>
              </div>
            </div>

            {client?.company && (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 pt-2 border-t border-zinc-100/80 dark:border-zinc-800/80">
                <Building2 className="w-3 h-3 text-subtle shrink-0" />
                <span className="truncate">{client.company}</span>
              </div>
            )}

            {client?.nip && (
              <div className="flex items-center gap-1.5 text-[10px] text-subtle font-mono mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>NIP: {client.nip}</span>
              </div>
            )}
          </div>

          {/* Nav links */}
          <div className="space-y-0.5">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-subtle" />
              Visão Geral
            </Link>

            <Link
              to="/documents"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-subtle" />
              Meus Processos
            </Link>

            <Link
              to="/tickets"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-subtle" />
              Suporte & Atendimento
            </Link>

            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-subtle" />
              Notificações
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Terminar Sessão
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
