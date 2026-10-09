import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';

interface NavbarProps {
  clientUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  clientUrl = 'http://localhost:5173/auth/login',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const lastScrollY = useRef<number>(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;

      setScrolled(currentY > 20);
      setVisible(!scrollingDown || currentY < 80);

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Segurança', href: '#seguranca' },
    { label: 'Planos', href: '#precos' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 px-3 sm:px-6 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      } ${scrolled ? 'pt-3' : 'pt-0'}`}
    >
      <div
        className={`max-w-6xl mx-auto rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-all duration-300 shadow-sm`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <a href="#" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center transition-transform group-hover:scale-95">
                <ShieldCheck className="w-4.5 h-4.5 text-white dark:text-zinc-950" />
              </div>
              <span className="font-semibold text-base text-zinc-900 dark:text-white tracking-tight">
                VA OneGest
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <a
                href={clientUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md transition-colors"
              >
                Portal do Cliente
              </a>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden px-4 sm:px-6 pt-2 pb-5 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-1">
                <a
                  href={clientUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center px-4 py-2.5 text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md"
                >
                  Portal do Cliente
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
