import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Card, CardContent } from '@accountable/ui';
import { useTheme } from '../../hooks/useTheme.js';

export const ClientBrandMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div
    aria-hidden="true"
    className={`${size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs'} rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold tracking-tight shadow-xs shrink-0`}
  >
    VA
  </div>
);

/** Moldura das páginas de acesso do portal — estilo original (cartão centrado). */
export const ClientAuthShell: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          data-testid="theme-toggle"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-sm mx-auto shadow-xs tracking-tight">
            VA
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
          {subtitle && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="pt-6 space-y-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};

/** Campo para o código de 6 dígitos (teclado numérico, auto-preenchimento de OTP). */
export const OtpInput: React.FC<{ value: string; onChange: (v: string) => void; label?: string }> = ({
  value,
  onChange,
  label = 'Código de verificação',
}) => {
  const id = React.useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        placeholder="000000"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="w-full h-12 rounded-lg border border-border bg-surface text-center font-mono text-2xl tracking-[0.5em] text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  );
};
