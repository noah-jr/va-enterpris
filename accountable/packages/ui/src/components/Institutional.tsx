import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn.js';

// ============================================================
// PageHeader — título institucional de página
// ============================================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Ícone opcional à esquerda do título. */
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon, actions, className }) => (
  <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border', className)}>
    <div className="flex items-start gap-3 min-w-0">
      {icon && (
        <div className="w-10 h-10 shrink-0 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

// ============================================================
// StatCard — indicador (KPI)
// ============================================================

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, hint, icon, className, ...rest }) => (
  <div
    data-testid={rest['data-testid']}
    className={cn('rounded-xl border border-border bg-surface p-5 shadow-card flex flex-col gap-3', className)}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      {icon && <span className="text-primary">{icon}</span>}
    </div>
    <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
    {hint && <div className="text-xs text-subtle">{hint}</div>}
  </div>
);

// ============================================================
// Badge
// ============================================================

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-muted border-border',
  primary: 'bg-primary-soft text-primary border-primary/20',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70',
  danger: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/70',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/70',
};

export const Badge: React.FC<{ tone?: BadgeTone; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  children,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium whitespace-nowrap',
      BADGE_TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);

// ============================================================
// EmptyState
// ============================================================

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="py-14 px-6 flex flex-col items-center text-center gap-2">
    {icon && <div className="w-11 h-11 rounded-full bg-surface-muted text-subtle flex items-center justify-center mb-1">{icon}</div>}
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description && <p className="text-xs text-muted max-w-sm">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

// ============================================================
// Modal — diálogo acessível (Esc fecha, foco inicial, aria-modal)
// ============================================================

export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** alertdialog para confirmações destrutivas. */
  role?: 'dialog' | 'alertdialog';
}

const MODAL_SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
  role = 'dialog',
}) => {
  const titleId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    const firstField = panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-modal-close])');
    firstField?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'w-full max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-surface text-foreground shadow-2xl',
          MODAL_SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-foreground">
              {title}
            </h2>
            {description && <p className="text-xs text-muted mt-1">{description}</p>}
          </div>
          <button
            type="button"
            data-modal-close
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-md text-subtle hover:text-foreground hover:bg-surface-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border bg-surface-muted/60 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

// ============================================================
// Campos de formulário (select, textarea, alerta)
// ============================================================

const FIELD =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }
>(({ label, error, id, className, children, ...props }, ref) => {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <select ref={ref} id={selectId} className={cn(FIELD, 'h-9 py-1.5', error && 'border-danger', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-[11px] text-danger font-medium">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ label, error, id, className, ...props }, ref) => {
  const autoId = React.useId();
  const areaId = id ?? autoId;
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={areaId} className="block text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <textarea ref={ref} id={areaId} className={cn(FIELD, 'resize-y', error && 'border-danger', className)} {...props} />
      {error && <p className="text-[11px] text-danger font-medium">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

export const Alert: React.FC<{ tone?: 'danger' | 'success' | 'info' | 'warning'; children: React.ReactNode; className?: string }> = ({
  tone = 'info',
  children,
  className,
}) => {
  const tones = {
    danger: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900',
    warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
  };
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('px-3.5 py-3 rounded-lg border text-sm', tones[tone], className)}>
      {children}
    </div>
  );
};

// ============================================================
// Formatação (AOA / datas)
// ============================================================

const kwanza = new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 });

/** 125000 → "125 000 Kz" */
export function formatKwanza(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return kwanza.format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}
