import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { ClientSidebar } from './layout/ClientSidebar.js';
import { ClientHeader } from './layout/ClientHeader.js';

export const ClientLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile drawer upon route transition
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen shrink-0">
        <ClientSidebar />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-zinc-950 shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <ClientSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Right Column: Header + Main + Footer */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-[#0c0c0e] transition-colors">
        <ClientHeader
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Workspace Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 py-4 px-3.5 sm:px-6 lg:px-8 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
              <span>VA OneGest — Plataforma de Tramitação e Custódia Documental</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span>Ligação segura (HTTPS)</span>
              <span>•</span>
              <span>Acessos registados em auditoria</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
