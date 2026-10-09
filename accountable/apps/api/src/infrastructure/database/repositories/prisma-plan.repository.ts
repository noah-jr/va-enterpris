import { type PrismaClient, Prisma } from '@prisma/client';
import type {
  CreatePlanData,
  IPlanRepository,
  PlanEntity,
  UpdatePlanData,
} from '../../../domain/repositories/plan.repository.interface.js';

function toEntity(plan: {
  id: string;
  name: string;
  badge: string | null;
  description: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  currency: string;
  features: Prisma.JsonValue;
  ctaText: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): PlanEntity {
  return {
    ...plan,
    features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
  };
}

export class PrismaPlanRepository implements IPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllActive(): Promise<PlanEntity[]> {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
    return plans.map(toEntity);
  }

  async findAll(): Promise<PlanEntity[]> {
    const plans = await this.prisma.plan.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
    return plans.map(toEntity);
  }

  async findById(id: string): Promise<PlanEntity | null> {
    const plan = await this.prisma.plan.findFirst({
      where: { id, deletedAt: null },
    });
    return plan ? toEntity(plan) : null;
  }

  async findByName(name: string): Promise<PlanEntity | null> {
    const plan = await this.prisma.plan.findFirst({
      where: { name, deletedAt: null },
    });
    return plan ? toEntity(plan) : null;
  }

  async create(data: CreatePlanData): Promise<PlanEntity> {
    const plan = await this.prisma.plan.create({
      data: {
        name: data.name,
        badge: data.badge ?? null,
        description: data.description,
        priceMonthly: data.priceMonthly ?? null,
        priceAnnual: data.priceAnnual ?? null,
        currency: data.currency ?? 'EUR',
        features: data.features as Prisma.InputJsonValue,
        ctaText: data.ctaText,
        isPopular: data.isPopular ?? false,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return toEntity(plan);
  }

  async update(id: string, data: UpdatePlanData): Promise<PlanEntity> {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.badge !== undefined ? { badge: data.badge } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.priceMonthly !== undefined ? { priceMonthly: data.priceMonthly } : {}),
        ...(data.priceAnnual !== undefined ? { priceAnnual: data.priceAnnual } : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.features !== undefined ? { features: data.features as Prisma.InputJsonValue } : {}),
        ...(data.ctaText !== undefined ? { ctaText: data.ctaText } : {}),
        ...(data.isPopular !== undefined ? { isPopular: data.isPopular } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
    return toEntity(plan);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.plan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
