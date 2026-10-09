import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  DocumentStatusBadge,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
  formatDate,
  formatKwanza,
} from '@accountable/ui';
import { ArrowRight, FileCheck2, FileText, LayoutDashboard, LifeBuoy, TrendingUp, Users, Wallet } from 'lucide-react';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { ColumnChart, RankedBarChart, type ChartPoint } from '../../components/charts/Charts.js';

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SUBMITTED: 'Submetido',
  IN_ANALYSIS: 'Em análise',
  AWAITING_DOCUMENT: 'Aguarda documento',
  IN_PROCESSING: 'Em processamento',
  REPLIED: 'Respondido',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rejeitado',
  ARCHIVED: 'Arquivado',
};

/** "2026-03" → { label: "Mar", fullLabel: "Março 2026" } */
function monthLabels(ym: string): { label: string; fullLabel: string } {
  const [year, month] = ym.split('-').map(Number);
  const idx = (month ?? 1) - 1;
  return { label: MONTHS_PT[idx] ?? ym, fullLabel: `${MONTHS_FULL[idx] ?? ''} ${year}` };
}

const nf = new Intl.NumberFormat('pt-PT');

export const AdminDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAdminAuthStore();
  const canSeeStats = hasPermission('reports:read');

  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApiService.getStatsOverview(),
    enabled: canSeeStats,
  });
  const recent = useQuery({
    queryKey: ['admin', 'documents', 'recent'],
    queryFn: () => adminApiService.listDocuments({ perPage: 8 }),
    enabled: hasPermission('documents:read'),
  });

  const data = stats.data?.data;

  const clientsSeries: ChartPoint[] = (data?.clientsPerMonth ?? []).map((m) => ({
    ...monthLabels(m.month),
    values: { clients: m.count },
  }));
  const documentsSeries: ChartPoint[] = (data?.documentsPerMonth ?? []).map((m) => ({
    ...monthLabels(m.month),
    values: { created: m.created, completed: m.completed },
  }));

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<LayoutDashboard className="w-5 h-5" />}
        title="Visão Geral"
        description={`Bem-vindo(a), ${user?.name ?? user?.email ?? ''}. Indicadores dos últimos 12 meses.`}
        actions={
          <Link to="/documents">
            <Button variant="outline" size="sm">
              Ver processos <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      {canSeeStats && stats.isLoading && (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="dashboard-kpis">
            <StatCard
              data-testid="kpi-clients"
              label="Clientes registados"
              value={nf.format(data.totals.clients)}
              hint={`${nf.format(data.totals.activeClients)} ativos · +${nf.format(data.totals.newClientsThisMonth)} este mês`}
              icon={<Users className="w-4 h-4" />}
            />
            <StatCard
              data-testid="kpi-documents"
              label="Processos tramitados"
              value={nf.format(data.totals.documents)}
              hint={`${nf.format(data.totals.documentsInProgress)} em curso · ${nf.format(data.totals.documentsCompleted)} concluídos`}
              icon={<FileCheck2 className="w-4 h-4" />}
            />
            <StatCard
              label="Tickets em aberto"
              value={nf.format(data.totals.openTickets)}
              hint="Abertos, em curso ou a aguardar o cliente"
              icon={<LifeBuoy className="w-4 h-4" />}
            />
            <StatCard
              data-testid="kpi-mrr"
              label="Receita recorrente mensal"
              value={formatKwanza(data.totals.monthlyRecurringRevenue)}
              hint={`${nf.format(data.totals.activeSubscriptions)} subscrições ativas`}
              icon={<Wallet className="w-4 h-4" />}
            />
          </div>

          <div className="grid xl:grid-cols-2 gap-4">
            <ColumnChart
              testId="chart-clients"
              title="Clientes registados por mês"
              description="Novos registos de clientes nos últimos 12 meses"
              data={clientsSeries}
              series={[{ key: 'clients', label: 'Clientes', colorClass: 'fill-series-1', swatchClass: 'bg-series-1' }]}
            />
            <ColumnChart
              testId="chart-documents"
              title="Processos tramitados por mês"
              description="Processos criados e concluídos em cada mês"
              data={documentsSeries}
              series={[
                { key: 'created', label: 'Criados', colorClass: 'fill-series-1', swatchClass: 'bg-series-1' },
                { key: 'completed', label: 'Concluídos', colorClass: 'fill-series-2', swatchClass: 'bg-series-2' },
              ]}
            />
          </div>

          <RankedBarChart
            testId="chart-status"
            title="Processos por estado"
            description="Distribuição atual de todos os processos"
            valueLabel="Processos"
            items={data.documentsByStatus.map((s) => ({ label: STATUS_LABELS[s.status] ?? s.status, value: s.count }))}
          />
        </>
      )}

      {!canSeeStats && (
        <p className="text-xs text-muted flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Os indicadores e gráficos requerem a permissão «Relatórios».
        </p>
      )}

      {hasPermission('documents:read') && (
        <section className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
          <header className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Processos recentes</h2>
              <p className="text-xs text-muted">Últimas submissões</p>
            </div>
            <Link to="/documents" className="text-xs font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </header>
          {recent.isLoading ? (
            <div className="py-10 flex justify-center">
              <Spinner />
            </div>
          ) : (recent.data?.data ?? []).length === 0 ? (
            <EmptyState icon={<FileText className="w-5 h-5" />} title="Ainda não há processos" />
          ) : (
            <ul className="divide-y divide-border">
              {recent.data!.data.map((doc) => (
                <li key={doc.id}>
                  <Link to={`/documents/${doc.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-muted/60">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground truncate">{doc.title}</span>
                      <span className="block text-xs text-muted">{formatDate(doc.createdAt)}</span>
                    </span>
                    <DocumentStatusBadge status={doc.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};
