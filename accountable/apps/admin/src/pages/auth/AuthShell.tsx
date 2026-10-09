import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Card, CardContent } from '@accountable/ui';
import { useTheme } from '../../hooks/useTheme.js';

/** Moldura das páginas de acesso — estilo original (cartão centrado, minimalista). */
export const AuthShell: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-50 dark:bg-[#09090b] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          data-testid="theme-toggle"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-sm mx-auto shadow-sm tracking-tight">
            VA
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
        <Card className="bg-white dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardContent className="pt-6 space-y-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};
