import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, FileText, Users, Target,
  ArrowUpRight, ArrowDownRight, Loader2,
  Wallet, ShieldCheck, Search, Plus, ActivitySquare
} from 'lucide-react';
import api from '../api';
import { useMe, usePermissions } from '../auth/useAuth';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, CartesianGrid
} from 'recharts';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { formatCurrency } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { data: user } = useMe();
  const { hasPermission } = usePermissions();
  const [range, setRange] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [time, setTime] = useState(new Date());
  const canViewDashboard = hasPermission('dashboard:view');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cached = useLiveQuery(() => db.stats.get(range));

  const { data: remoteData, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview', range],
    queryFn: async () => {
      const resp = await api.get(`/dashboard?range=${range}`);
      await db.stats.put({ id: range, data: resp.data, lastUpdated: new Date().toISOString() });
      return resp.data;
    },
    enabled: !!user && canViewDashboard,
    retry: false
  });

  const data = remoteData || cached?.data;
  const isError = !!error && !data;

  /* ── States ── */
  if (!canViewDashboard) return (
    <EmptyState
      icon={<ShieldCheck size={20} />}
      title="Acesso restrito"
      description="O seu perfil não tem permissão para visualizar o painel. Contacte o administrador."
    >
      <Link to="/" className="premium-button-secondary text-sm">Voltar</Link>
    </EmptyState>
  );

  if (isError) return (
    <EmptyState
      icon={<ShieldCheck size={20} />}
      color="text-rose-500"
      bg="bg-rose-50 dark:bg-rose-500/10"
      title="Erro ao carregar"
      description="Não foi possível obter os dados. Verifique a sua subscrição ou ligação."
    >
      <Link to="/subscription" className="premium-button-primary text-sm">Ver subscrição</Link>
    </EmptyState>
  );

  if (isLoading && !data) return (
    <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
      <Loader2 size={18} className="animate-spin" />
      <span className="text-sm">A carregar...</span>
    </div>
  );

  const stats = data?.stats || { totalRevenue: 0, pendingFinance: 0, totalClients: 0, pendingRevenue: 0, totalInvoices: 0 };
  const salesChartData      = data?.salesChartData      || [];
  const recentInvoices      = data?.recentInvoices      || [];
  const statusDistribution  = data?.statusDistribution  || [];
  const categoryDistribution = data?.categoryDistribution || [];

  const kpis = [
    {
      title: 'Receita total',
      value: fmt(stats.totalRevenue),
      change: '+12.5%', trend: 'up',
      icon: <DollarSign size={15} />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
      title: 'Custos operacionais',
      value: fmt(stats.pendingFinance),
      change: '-2.4%', trend: 'down',
      icon: <Target size={15} />,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-500/10'
    },
    {
      title: 'Clientes',
      value: stats.totalClients?.toString() || '0',
      change: '+8%', trend: 'up',
      icon: <Users size={15} />,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10'
    },
    {
      title: 'Faturas pendentes',
      value: fmt(stats.pendingRevenue),
      change: 'Estável', trend: 'neutral',
      icon: <Wallet size={15} />,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10'
    },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Olá, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {format(time, "EEEE, dd 'de' MMMM · HH:mm:ss", { locale: pt })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
            className="premium-button-secondary !px-3 !py-2"
          >
            <Search size={15} />
            <span className="text-sm hidden sm:inline">Pesquisar</span>
          </button>
          <Link to="/invoices?create=true" className="premium-button-primary !px-3 !py-2">
            <Plus size={15} />
            <span className="text-sm">Nova fatura</span>
          </Link>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="premium-card p-4 flex items-start gap-3">
            <div className={`kpi-icon shrink-0 ${kpi.color} ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{kpi.title}</p>
              <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight truncate">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === 'up'   && <ArrowUpRight   size={11} className="text-emerald-500 shrink-0" />}
                {kpi.trend === 'down' && <ArrowDownRight size={11} className="text-rose-500 shrink-0" />}
                <span className={`text-[11px] font-medium ${
                  kpi.trend === 'up'   ? 'text-emerald-500' :
                  kpi.trend === 'down' ? 'text-rose-500'    :
                  'text-[var(--text-muted)]'
                }`}>{kpi.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart — 2/3 */}
        <div className="lg:col-span-2 premium-card flex flex-col" style={{ height: 320 }}>
          <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ActivitySquare size={15} className="text-[var(--accent)]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Desempenho de Faturação</h2>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Desempenho de faturação</h2>
            </div>
            <div className="flex items-center gap-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-0.5">
              {[
                { id: 'monthly', label: 'Mês'    },
                { id: 'weekly',  label: 'Semana' },
                { id: 'daily',   label: 'Dia'    },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setRange(t.id as any)}
                  className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-bold transition-colors ${
                    range === t.id
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="name" fontSize={11} tickLine={false} axisLine={false}
                  tick={{ fill: 'var(--text-muted)' }} dy={8}
                  tickFormatter={(v) => { try { return format(new Date(v), 'dd/MM'); } catch { return v; } }}
                />
                <YAxis
                  fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: 'var(--text-muted)' }} dx={-8}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: 12,
                    padding: '8px 12px'
                  }}
                  formatter={(v: any) => [fmt(v), 'Receita']}
                  cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone" dataKey="value"
                  stroke="var(--accent)" strokeWidth={2}
                  fillOpacity={1} fill="url(#revenue)"
                  dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart — 1/3 */}
        <div className="premium-card flex flex-col" style={{ height: 320 }}>
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Estado das Faturas</h2>
          </div>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  innerRadius={60} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                  strokeWidth={0}
                >
                  {statusDistribution.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 12,
                    padding: '8px 12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[10px] text-[var(--text-muted)]">Total</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{stats.totalInvoices || 0}</p>
            </div>
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {statusDistribution.map((entry: any, i: number) => (
              <div key={entry.name} className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[11px] text-[var(--text-muted)] truncate">{entry.name}</span>
                <span className="text-[11px] font-bold text-[var(--text-primary)] ml-auto shrink-0">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart */}
        <div className="premium-card flex flex-col" style={{ height: 280 }}>
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Receita por Categoria</h2>
          </div>
          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical" barSize={8}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name" type="category" fontSize={11} width={75}
                  tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v: any) => fmt(v)}
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 12,
                    padding: '8px 12px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryDistribution.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transações recentes */}
        <div className="lg:col-span-2 premium-card flex flex-col" style={{ height: 280 }}>
          <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Últimas transações</h2>
            <Link to="/invoices" className="text-xs text-[var(--accent)] hover:underline font-medium">
              Ver tudo
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  {['Número', 'Cliente', 'Valor', 'Estado'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-[11px] font-bold text-[var(--text-muted)] ${h === 'Valor' ? 'text-right' : h === 'Estado' ? 'text-center' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">{inv.number}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)] max-w-[140px] truncate">{inv.clientName}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-right tabular-nums">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`badge ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {inv.status === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {recentInvoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                      Sem transações recentes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Estado vazio ou erro ── */
function EmptyState({
  icon, title, description, children,
  color = 'text-[var(--accent)]',
  bg = 'bg-[var(--accent-soft)]'
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-4 animate-fade-in">
      <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center ${color} ${bg}`}>
        {icon}
      </div>
      <div className="max-w-xs space-y-1">
        <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default Dashboard;
