import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  LifeBuoy,
  Bell,
  LogOut,
  Lock,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store.js';
import { authService } from '../../services/auth.service.js';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface ClientSidebarProps {
  onNavigate?: () => void;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { client, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate('/auth/login');
    }
  };

  const navSections: { label: string; items: NavItem[] }[] = [
    {
      label: 'Principal',
      items: [
        { label: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Meus Processos', path: '/documents', icon: FileText },
      ],
    },
    {
      label: 'Comunicação',
      items: [
        { label: 'Suporte & Tickets', path: '/tickets', icon: LifeBuoy },
        { label: 'Notificações', path: '/notifications', icon: Bell },
      ],
    },
    {
      label: 'Conta',
      items: [{ label: 'Definições', path: '/settings', icon: Settings }],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const initials = client?.name
    ? client.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    : 'CL';

  return (
    <aside className="w-64 flex flex-col bg-white dark:bg-[#09090b] border-r border-zinc-200/80 dark:border-zinc-800/80 p-4 shrink-0 h-full select-none transition-colors">
      {/* Brand & Organization */}
      <div className="flex items-center gap-3 px-2 py-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
          VA
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">VA OneGest</span>
            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono border border-zinc-200 dark:border-zinc-700">
              Client
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500 truncate">
            {client?.company || client?.name || 'Portal do Cliente'}
          </p>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="mb-4">
        <Link
          to="/documents/new"
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Processo</span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto space-y-4 pr-1">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-500 px-2.5 tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Security & System Info Card */}
      <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
        <div className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 space-y-1.5 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>Documentos Protegidos</span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Ligações de download com expiração de 15 minutos e acessos registados.
          </p>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 font-semibold text-[11px] shrink-0">
              {initials}
            </div>
            <div className="truncate text-left leading-tight">
              <p className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">{client?.name || 'Cliente'}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 truncate">
                {client?.nip ? `NIP ${client.nip}` : client?.email || ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-md text-zinc-500 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Terminar Sessão"
            aria-label="Terminar Sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
