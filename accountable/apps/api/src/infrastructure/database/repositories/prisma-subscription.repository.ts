import type { Prisma, PrismaClient } from '@prisma/client';
import type {
  CreateSubscriptionData,
  ISubscriptionRepository,
  SubscriptionEntity,
  UpdateSubscriptionData,
} from '../../../domain/repositories/subscription.repository.interface.js';

const INCLUDE = {
  client: { select: { name: true, email: true } },
  plan: { select: { name: true } },
} satisfies Prisma.ClientSubscriptionInclude;

type Row = Prisma.ClientSubscriptionGetPayload<{ include: typeof INCLUDE }>;

function toEntity(row: Row): SubscriptionEntity {
  return {
    id: row.id,
    clientId: row.clientId,
    clientName: row.client.name,
    clientEmail: row.client.email,
    planId: row.planId,
    planName: row.plan.name,
    status: row.status,
    billingCycle: row.billingCycle,
    amount: row.amount,
    currency: row.currency,
    startDate: row.startDate,
    currentPeriodEnd: row.currentPeriodEnd,
    cancelledAt: row.cancelledAt,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSubscriptionData): Promise<SubscriptionEntity> {
    const row = await this.prisma.clientSubscription.create({ data: { ...data, currency: 'AOA' }, include: INCLUDE });
    return toEntity(row);
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const row = await this.prisma.clientSubscription.findUnique({ where: { id }, include: INCLUDE });
    return row ? toEntity(row) : null;
  }

  async findOpenByClient(clientId: string): Promise<SubscriptionEntity | null> {
    const row = await this.prisma.clientSubscription.findFirst({
      where: { clientId, status: { not: 'CANCELLED' } },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return row ? toEntity(row) : null;
  }

  async list(params: { page: number; perPage: number; status?: SubscriptionEntity['status']; clientId?: string }) {
    const where: Prisma.ClientSubscriptionWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.clientId ? { clientId: params.clientId } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.clientSubscription.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.perPage,
        take: params.perPage,
      }),
      this.prisma.clientSubscription.count({ where }),
    ]);
    return { items: rows.map(toEntity), total };
  }

  async update(id: string, data: UpdateSubscriptionData): Promise<SubscriptionEntity> {
    const row = await this.prisma.clientSubscription.update({ where: { id }, data, include: INCLUDE });
    return toEntity(row);
  }
}
