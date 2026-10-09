import * as React from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { useAdminLogout } from '../../lib/use-admin-logout.js';
import { initialsFromEmail } from '../../lib/relative-time.js';
import { useClickOutside } from '../../lib/use-click-outside.js';

export const UserMenu: React.FC = () => {
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminLogout();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  if (!user) return null;

  const initials = initialsFromEmail(user.email);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu do utilizador"
        data-testid="header-user-menu"
        className={`flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-lg transition-colors ${
          open ? 'bg-zinc-800' : 'hover:bg-zinc-800/60'
        }`}
      >
        <span className="w-7 h-7 rounded-lg bg-surface-muted border border-border/60 text-foreground text-xs font-semibold flex items-center justify-center">
          {initials}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="fixed right-4 top-16 w-60 sm:absolute sm:right-0 sm:top-11 rounded-xl bg-surface border border-border z-40 overflow-hidden shadow-2xl">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {user.roles.map((r) => (
                <span
                  key={r}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-surface border border-border text-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="py-1">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              data-testid="user-menu-settings"
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted hover:text-foreground hover:bg-surface-muted/60 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted" />
              Definições
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              data-testid="user-menu-logout"
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-surface-muted/60 transition-colors"
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
