import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  className?: string;
  onClick?: () => void;
}

export function KpiCard({ label, value, sub, icon, color, bg, className = '', onClick }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={`premium-card p-4 flex items-start gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className={`kpi-icon shrink-0 ${color} ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--text-muted)] font-500 mb-0.5 truncate">{label}</p>
        <p className="text-lg font-600 text-[var(--text-primary)] tabular-nums leading-tight">{value}</p>
        {sub && (
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">{sub}</span>
        )}
      </div>
    </div>
  );
}
