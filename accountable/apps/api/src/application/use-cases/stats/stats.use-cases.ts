import type { StatsOverviewDTO } from '@accountable/types';
import type { IStatsRepository } from '../../../domain/repositories/index.js';
import { monthlyRevenue } from '../subscriptions/subscriptions.use-cases.js';

const IN_PROGRESS_STATUSES = new Set(['SUBMITTED', 'IN_ANALYSIS', 'AWAITING_DOCUMENT', 'IN_PROCESSING', 'REPLIED']);

/** Lista YYYY-MM dos últimos `count` meses (inclui o atual), do mais antigo ao mais recente. */
export function lastMonths(count: number, now: Date = new Date()): string[] {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

/** Preenche meses sem registos com zero, para os gráficos terem um eixo contínuo. */
export function fillMonths(months: string[], rows: Array<{ month: string; count: number }>): Map<string, number> {
  const byMonth = new Map(rows.map((r) => [r.month, r.count]));
  return new Map(months.map((m) => [m, byMonth.get(m) ?? 0]));
}

export class GetStatsOverviewUseCase {
  constructor(private readonly stats: IStatsRepository) {}

  async execute(now: Date = new Date()): Promise<StatsOverviewDTO> {
    const months = lastMonths(12, now);
    const from = new Date(`${months[0]}-01T00:00:00Z`);
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [clients, newClients, clientsRows, createdRows, completedRows, byStatus, openTickets, subsByStatus, active] =
      await Promise.all([
        this.stats.countClients(),
        this.stats.countClientsCreatedSince(startOfMonth),
        this.stats.clientsCreatedPerMonth(from),
        this.stats.documentsCreatedPerMonth(from),
        this.stats.documentsCompletedPerMonth(from),
        this.stats.documentsByStatus(),
        this.stats.countOpenTickets(),
        this.stats.subscriptionsByStatus(),
        this.stats.activeSubscriptionAmounts(),
      ]);

    const clientsPerMonth = fillMonths(months, clientsRows);
    const created = fillMonths(months, createdRows);
    const completed = fillMonths(months, completedRows);
    const count = (predicate: (status: string) => boolean) =>
      byStatus.filter((s) => predicate(s.status)).reduce((sum, s) => sum + s.count, 0);

    return {
      totals: {
        clients: clients.total,
        activeClients: clients.active,
        newClientsThisMonth: newClients,
        documents: count(() => true),
        documentsInProgress: count((s) => IN_PROGRESS_STATUSES.has(s)),
        documentsCompleted: count((s) => s === 'COMPLETED'),
        openTickets,
        activeSubscriptions: active.length,
        monthlyRecurringRevenue: active.reduce((sum, s) => sum + monthlyRevenue(s), 0),
      },
      clientsPerMonth: months.map((month) => ({ month, count: clientsPerMonth.get(month) ?? 0 })),
      documentsPerMonth: months.map((month) => ({
        month,
        created: created.get(month) ?? 0,
        completed: completed.get(month) ?? 0,
      })),
      documentsByStatus: byStatus.sort((a, b) => b.count - a.count),
      subscriptionsByStatus: subsByStatus,
    };
  }
}
