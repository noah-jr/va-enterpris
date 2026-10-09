import { Prisma, type PrismaClient } from '@prisma/client';
import type { BillingCycle, SubscriptionStatus } from '@accountable/types';
import type { IStatsRepository } from '../../../domain/repositories/stats.repository.interface.js';

interface MonthRow {
  month: string;
  count: bigint | number;
}

const toMonthly = (rows: MonthRow[]) => rows.map((r) => ({ month: r.month, count: Number(r.count) }));

/** Agregações do painel — calculadas na base de dados (nunca no browser). */
export class PrismaStatsRepository implements IStatsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countClients(): Promise<{ total: number; active: number }> {
    const [total, active] = await Promise.all([
      this.prisma.client.count({ where: { deletedAt: null } }),
      this.prisma.client.count({ where: { deletedAt: null, isActive: true } }),
    ]);
    return { total, active };
  }

  async countClientsCreatedSince(from: Date): Promise<number> {
    return this.prisma.client.count({ where: { deletedAt: null, createdAt: { gte: from } } });
  }

  async clientsCreatedPerMonth(from: Date) {
    const rows = await this.prisma.$queryRaw<MonthRow[]>(Prisma.sql`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM clients
      WHERE deleted_at IS NULL AND created_at >= ${from}
      GROUP BY month ORDER BY month`);
    return toMonthly(rows);
  }

  async documentsCreatedPerMonth(from: Date) {
    const rows = await this.prisma.$queryRaw<MonthRow[]>(Prisma.sql`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM documents
      WHERE deleted_at IS NULL AND created_at >= ${from}
      GROUP BY month ORDER BY month`);
    return toMonthly(rows);
  }

  async documentsCompletedPerMonth(from: Date) {
    const rows = await this.prisma.$queryRaw<MonthRow[]>(Prisma.sql`
      SELECT DATE_FORMAT(h.created_at, '%Y-%m') AS month, COUNT(DISTINCT h.document_id) AS count
      FROM document_status_history h
      WHERE h.to_status = 'COMPLETED' AND h.created_at >= ${from}
      GROUP BY month ORDER BY month`);
    return toMonthly(rows);
  }

  async documentsByStatus() {
    const groups = await this.prisma.document.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    return groups.map((g) => ({ status: g.status, count: g._count._all }));
  }

  async countOpenTickets(): Promise<number> {
    return this.prisma.ticket.count({
      where: { deletedAt: null, status: { in: ['OPEN', 'IN_PROGRESS', 'AWAITING_CLIENT'] } },
    });
  }

  async subscriptionsByStatus() {
    const groups = await this.prisma.clientSubscription.groupBy({ by: ['status'], _count: { _all: true } });
    return groups.map((g) => ({ status: g.status as SubscriptionStatus, count: g._count._all }));
  }

  async activeSubscriptionAmounts() {
    const rows = await this.prisma.clientSubscription.findMany({
      where: { status: 'ACTIVE' },
      select: { amount: true, billingCycle: true },
    });
    return rows.map((r) => ({ amount: r.amount, billingCycle: r.billingCycle as BillingCycle }));
  }
}
