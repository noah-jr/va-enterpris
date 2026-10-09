import { FileText, Home, Monitor, Users, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const QUICK_TABS = [
  { icon: Home,     label: 'Painel',   path: '/dashboard' },
  { icon: FileText, label: 'Faturas',  path: '/invoices'  },
  { icon: Users,    label: 'Clientes', path: '/clients'   },
  { icon: Monitor,  label: 'Venda',   path: '/pos'       },
];

const MobileNav = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[200] md:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-color)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 h-[60px]">
        {QUICK_TABS.map(({ icon: Icon, label, path }) => {
          const isActive =
            location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-[var(--radius-md)] transition-colors ${
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.6} />
              <span className={`text-[10px] leading-none ${isActive ? 'font-600' : 'font-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <Menu size={18} strokeWidth={1.6} />
          <span className="text-[10px] leading-none">Menu</span>
        </button>
      </div>
    </nav>
  );
};

export { MobileNav };
