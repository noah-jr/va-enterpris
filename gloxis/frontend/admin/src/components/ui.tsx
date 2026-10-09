import React from 'react'
import { CheckCircle, AlertTriangle, X, RefreshCw, Plus, Search, Filter, Save } from 'lucide-react'

// ─── cn helper ────────────────────────────────────────────────────────────────
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// ─── Page Shell ───────────────────────────────────────────────────────────────
interface PageShellProps {
  children: React.ReactNode
}
export function PageShell({ children }: PageShellProps) {
  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-5 animate-in fade-in duration-300 pb-10">
      {children}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children?: React.ReactNode
}
export function PageHeader({ icon: Icon, title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-4 shadow-xs transition-colors">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-zinc-900 dark:text-white uppercase">{title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5 leading-snug font-medium">{description}</p>
        </div>
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
  iconBg?: string
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}
export function KpiCard({ icon: Icon, iconColor = 'text-zinc-700 dark:text-zinc-300', iconBg = 'bg-zinc-100 dark:bg-zinc-800', label, value, sub, accent }: KpiCardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-zinc-900 p-4 border flex items-center gap-3.5 transition-all hover:shadow-md',
      accent ? 'border-zinc-900 dark:border-white' : 'border-zinc-200/40 dark:border-zinc-800/50 shadow-xs'
    )}>
      <div className={cn('w-10 h-10 flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg font-bold font-mono mt-0.5 truncate text-zinc-900 dark:text-white">{value}</p>
        {sub && <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Toolbar (Search + Filters + Actions) ─────────────────────────────────────
interface ToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
  rightActions?: React.ReactNode
}
export function Toolbar({ search, onSearchChange, searchPlaceholder = 'Pesquisar...', children, rightActions }: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2.5">
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 pl-8.5 pr-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
          {children}
        </div>
      )}
      {rightActions && <div className="flex items-center gap-2 shrink-0 sm:ml-auto">{rightActions}</div>}
    </div>
  )
}

// ─── Standalone Search Input ──────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Pesquisar...' }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 pl-8.5 pr-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
      />
    </div>
  )
}

// ─── Data Table Shell ─────────────────────────────────────────────────────────
interface DataTableProps {
  toolbar?: React.ReactNode
  children: React.ReactNode
  pagination?: React.ReactNode
}
export function DataTable({ toolbar, children, pagination }: DataTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-xs transition-colors">
      {toolbar && <div className="p-3.5 bg-zinc-50/50 dark:bg-zinc-800/50">{toolbar}</div>}
      <div className="overflow-x-auto">{children}</div>
      {pagination}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────
interface TableProps {
  headers: string[]
  children: React.ReactNode
  colSpan?: number
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
}
export function Table({ headers, children, colSpan, loading, empty, emptyMessage = 'Nenhum registo localizado.' }: TableProps) {
  const span = colSpan ?? headers.length
  return (
    <table className="w-full text-xs text-left border-collapse">
      <thead className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-100/90 dark:bg-zinc-800/90">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={cn('px-4 py-3 tracking-wider font-sans', i === headers.length - 1 && 'text-right')}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="text-zinc-900 dark:text-zinc-100">
        {loading ? (
          <tr>
            <td colSpan={span} className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">
              <div className="flex justify-center">
                <div className="w-5 h-5 border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" />
              </div>
            </td>
          </tr>
        ) : empty ? (
          <tr>
            <td colSpan={span} className="px-4 py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                  <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">{emptyMessage}</p>
              </div>
            </td>
          </tr>
        ) : children}
      </tbody>
    </table>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { className: string }> = {
  APROVADO:            { className: 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300' },
  APROVADA:            { className: 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300' },
  ATIVO:               { className: 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300' },
  PAGO:                { className: 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300' },
  PROCESSADO:          { className: 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300' },
  DESEMBOLSADO:        { className: 'bg-teal-100/80 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300' },
  PENDENTE:            { className: 'bg-amber-100/80 dark:bg-amber-950/70 text-amber-950 dark:text-amber-300' },
  PENDENTE_APROVACAO:  { className: 'bg-amber-100/80 dark:bg-amber-950/70 text-amber-950 dark:text-amber-300' },
  EM_ANALISE:          { className: 'bg-blue-100/80 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300' },
  EM_CURSO:            { className: 'bg-blue-100/80 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300' },
  REJEITADO:           { className: 'bg-rose-100/80 dark:bg-rose-950/70 text-rose-950 dark:text-rose-300' },
  REJEITADA:           { className: 'bg-rose-100/80 dark:bg-rose-950/70 text-rose-950 dark:text-rose-300' },
  REPROVADO:           { className: 'bg-rose-100/80 dark:bg-rose-950/70 text-rose-950 dark:text-rose-300' },
  REPROVADA:           { className: 'bg-rose-100/80 dark:bg-rose-950/70 text-rose-950 dark:text-rose-300' },
  CANCELADO:           { className: 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300' },
  ATRASADO:            { className: 'bg-rose-100/80 dark:bg-rose-950/70 text-rose-950 dark:text-rose-300' },
  INATIVO:             { className: 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300' },
  CONCLUIDO:           { className: 'bg-teal-100/80 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300' },
}

interface StatusBadgeProps {
  status: string
  label?: string
}
export function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? { className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300' }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase',
      cfg.className
    )}>
      <span className="w-1.5 h-1.5 bg-current opacity-90 shrink-0" />
      {label ?? status.replace(/_/g, ' ')}
    </span>
  )
}

// ─── Action Buttons ───────────────────────────────────────────────────────────
interface BtnPrimaryProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
}
export function BtnPrimary({ onClick, disabled, loading, icon: Icon, children, type = 'button' }: BtnPrimaryProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 font-bold transition-all text-xs shadow-2xs cursor-pointer disabled:opacity-50 uppercase tracking-wider"
    >
      {loading
        ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent animate-spin" />
        : Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  )
}

export function BtnSecondary({ onClick, disabled, icon: Icon, children, type = 'button' }: BtnPrimaryProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/70 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3.5 py-1.5 font-bold transition-all text-xs cursor-pointer disabled:opacity-50 uppercase tracking-wider shadow-2xs"
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />}
      {children}
    </button>
  )
}

export function BtnSuccess({ onClick, disabled, loading, icon: Icon, children, type = 'button' }: BtnPrimaryProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-1.5 font-bold transition-all text-xs cursor-pointer disabled:opacity-50 uppercase tracking-wider"
    >
      {loading
        ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
        : Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  )
}

export function BtnDanger({ onClick, disabled, loading, icon: Icon, children, type = 'button' }: BtnPrimaryProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 px-3.5 py-1.5 font-bold transition-all text-xs cursor-pointer disabled:opacity-50 uppercase tracking-wider"
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  )
}

export function BtnSave({ onClick, disabled, loading, saving, label = 'Guardar' }: {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  saving?: boolean
  label?: string
}) {
  return (
    <BtnPrimary onClick={onClick} disabled={disabled} loading={loading || saving} icon={Save}>
      {saving ? 'A guardar...' : label}
    </BtnPrimary>
  )
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
export function IconBtn({ onClick, title, icon: Icon, variant = 'default', disabled }: {
  onClick?: () => void
  title?: string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'danger'
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'p-1.5 border transition-all cursor-pointer disabled:opacity-50',
        variant === 'danger'
          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
          : 'bg-white dark:bg-zinc-800 border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
interface ModalProps {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}
export function Modal({ title, subtitle, icon: Icon, onClose, children, wide }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className={cn(
        'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-5 w-full space-y-4 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl max-h-[90vh] overflow-y-auto',
        wide ? 'max-w-2xl' : 'max-w-lg'
      )}>
        <div className="flex items-start justify-between pb-1">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">{title}</h3>
              {subtitle && <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Modal Footer ─────────────────────────────────────────────────────────────
interface ModalFooterProps {
  onCancel: () => void
  cancelLabel?: string
  children?: React.ReactNode
}
export function ModalFooter({ onCancel, cancelLabel = 'Cancelar', children }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
        {cancelLabel}
      </button>
      {children}
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}
export function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
        {label}{required && <span className="text-rose-600 dark:text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
}

export const inputClass = "w-full bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
export const selectClass = "w-full bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"

// ─── Toast Notification ───────────────────────────────────────────────────────
interface ToastProps {
  message: string
  type: 'success' | 'error'
}
export function Toast({ message, type }: ToastProps) {
  return (
    <div className={cn(
      'fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 border shadow-xl animate-in slide-in-from-top-3 duration-200 max-w-sm',
      type === 'success' ? 'bg-zinc-900 dark:bg-white border-zinc-700 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-900 border-rose-300 dark:border-rose-800 text-zinc-900 dark:text-zinc-100'
    )}>
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        : <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
      <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────
export function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 p-4 shadow-xs transition-colors', className)}>
      {children}
    </div>
  )
}

// ─── Refresh Button shorthand ─────────────────────────────────────────────────
export function BtnRefresh({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <BtnSecondary onClick={onClick} disabled={loading} icon={RefreshCw}>Atualizar</BtnSecondary>
  )
}

export function BtnNew({ onClick, label = 'Novo Registo' }: { onClick: () => void; label?: string }) {
  return (
    <BtnPrimary onClick={onClick} icon={Plus}>{label}</BtnPrimary>
  )
}

// ─── Info Row (para modais de detalhes) ───────────────────────────────────────
export function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start py-1">
      <span className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className={cn('text-xs font-bold text-zinc-900 dark:text-white text-right', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────
interface FilterSelectProps {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}
export function FilterSelect({ value, onChange, options, placeholder = 'Todos' }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Mono value (Kz currency) ─────────────────────────────────────────────────
export function KzValue({ value, className }: { value: number | string; className?: string }) {
  return (
    <span className={cn('font-mono font-bold text-zinc-900 dark:text-white', className)}>
      Kz {Number(value || 0).toLocaleString('pt-AO')}
    </span>
  )
}
