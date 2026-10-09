import type { BillingCycle, PaginatedResponse, SubscriptionDTO, SubscriptionStatus } from '@accountable/types';
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from '@accountable/schemas';
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/index.js';
import type {
  IAuditRepository,
  IClientRepository,
  IPlanRepository,
  ISubscriptionRepository,
  PlanEntity,
  SubscriptionEntity,
} from '../../../domain/repositories/index.js';
import type { IUnitOfWork } from '../../contracts/index.js';

// ------------------------------------------------------------
// Regras de preço e períodos (AOA, kwanzas inteiros)
// ------------------------------------------------------------

/**
 * `priceMonthly` é o preço mensal; `priceAnnual` é o preço MENSAL equivalente com
 * faturação anual (ex.: 36 000 Kz/mês × 12). O valor devolvido é o cobrado por ciclo.
 */
export function priceForCycle(plan: Pick<PlanEntity, 'priceMonthly' | 'priceAnnual'>, cycle: BillingCycle): number | null {
  if (cycle === 'MONTHLY') return plan.priceMonthly;
  return plan.priceAnnual !== null ? plan.priceAnnual * 12 : null;
}

export function addBillingPeriod(from: Date, cycle: BillingCycle): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + (cycle === 'MONTHLY' ? 1 : 12));
  return next;
}

/** Receita recorrente mensal de uma subscrição (anuais contam 1/12). */
export function monthlyRevenue(sub: Pick<SubscriptionEntity, 'amount' | 'billingCycle'>): number {
  return sub.billingCycle === 'MONTHLY' ? sub.amount : Math.round(sub.amount / 12);
}

const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  TRIAL: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['PAST_DUE', 'SUSPENDED', 'CANCELLED'],
  PAST_DUE: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
  SUSPENDED: ['ACTIVE', 'CANCELLED'],
  CANCELLED: [],
};

export function toSubscriptionDTO(s: SubscriptionEntity): SubscriptionDTO {
  return {
    ...s,
    startDate: s.startDate.toISOString(),
    currentPeriodEnd: s.currentPeriodEnd.toISOString(),
    cancelledAt: s.cancelledAt ? s.cancelledAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  };
}

interface ActorContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
}

async function loadSellablePlan(plans: IPlanRepository, planId: string): Promise<PlanEntity> {
  const plan = await plans.findById(planId);
  if (!plan || plan.deletedAt) throw new NotFoundError('Plano', planId);
  if (!plan.isActive) throw new BusinessRuleError('Este plano está inativo e não pode ser subscrito.');
  return plan;
}

function resolveAmount(plan: PlanEntity, cycle: BillingCycle, customAmount?: number): number {
  const amount = customAmount ?? priceForCycle(plan, cycle);
  if (amount === null) {
    throw new ValidationError(
      `O plano "${plan.name}" não tem preço ${cycle === 'MONTHLY' ? 'mensal' : 'anual'} definido — indique o valor acordado (AOA).`,
    );
  }
  return amount;
}

// ------------------------------------------------------------
export class ListSubscriptionsUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(params: { page?: number; perPage?: number; status?: SubscriptionStatus; clientId?: string }): Promise<
    PaginatedResponse<SubscriptionDTO>
  > {
    const page = Math.max(1, params.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params.perPage ?? 20));
    const { items, total } = await this.repository.list({ page, perPage, status: params.status, clientId: params.clientId });
    return { data: items.map(toSubscriptionDTO), total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }
}

export class GetClientSubscriptionUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(clientId: string): Promise<SubscriptionDTO | null> {
    const sub = await this.repository.findOpenByClient(clientId);
    return sub ? toSubscriptionDTO(sub) : null;
  }
}

export class CreateSubscriptionUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly planRepository: IPlanRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: CreateSubscriptionInput, context: ActorContext): Promise<SubscriptionDTO> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) throw new NotFoundError('Cliente', input.clientId);
    if (!client.isActive) throw new BusinessRuleError('Não é possível subscrever um cliente inativo ou bloqueado.');

    if (await this.repository.findOpenByClient(client.id)) {
      throw new ConflictError('Este cliente já tem uma subscrição em curso. Altere-a ou cancele-a primeiro.');
    }

    const plan = await loadSellablePlan(this.planRepository, input.planId);
    const amount = resolveAmount(plan, input.billingCycle, input.customAmount);
    const startDate = input.startDate ? new Date(input.startDate) : new Date();

    return this.unitOfWork.run(async () => {
      const created = await this.repository.create({
        clientId: client.id,
        planId: plan.id,
        status: input.status,
        billingCycle: input.billingCycle,
        amount,
        startDate,
        currentPeriodEnd: addBillingPeriod(startDate, input.billingCycle),
        notes: input.notes ?? null,
        createdById: context.actorId,
      });
      await this.auditRepository.log({
        userId: context.actorId,
        clientId: client.id,
        action: 'SUBSCRIPTION_CREATED',
        entity: 'ClientSubscription',
        entityId: created.id,
        newValues: { plan: plan.name, billingCycle: created.billingCycle, amount, currency: 'AOA', status: created.status },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return toSubscriptionDTO(created);
    });
  }
}

export class UpdateSubscriptionUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(id: string, input: UpdateSubscriptionInput, context: ActorContext): Promise<SubscriptionDTO> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Subscrição', id);
    if (current.status === 'CANCELLED') {
      throw new BusinessRuleError('Subscrições canceladas não podem ser alteradas — crie uma nova.');
    }

    if (input.status && input.status !== current.status && !ALLOWED_TRANSITIONS[current.status].includes(input.status)) {
      throw new BusinessRuleError(`Transição inválida: ${current.status} → ${input.status}.`);
    }

    const planChanged = input.planId !== undefined && input.planId !== current.planId;
    const cycleChanged = input.billingCycle !== undefined && input.billingCycle !== current.billingCycle;
    const cycle = input.billingCycle ?? current.billingCycle;

    let amount = input.customAmount;
    if (amount === undefined && (planChanged || cycleChanged)) {
      const plan = await loadSellablePlan(this.planRepository, input.planId ?? current.planId);
      amount = resolveAmount(plan, cycle);
    }

    const cancelling = input.status === 'CANCELLED';

    return this.unitOfWork.run(async () => {
      const updated = await this.repository.update(id, {
        ...(input.planId !== undefined ? { planId: input.planId } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.billingCycle !== undefined ? { billingCycle: input.billingCycle } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(cancelling ? { cancelledAt: new Date() } : {}),
      });
      await this.auditRepository.log({
        userId: context.actorId,
        clientId: current.clientId,
        action: cancelling ? 'SUBSCRIPTION_CANCELLED' : 'SUBSCRIPTION_UPDATED',
        entity: 'ClientSubscription',
        entityId: id,
        oldValues: { plan: current.planName, status: current.status, billingCycle: current.billingCycle, amount: current.amount },
        newValues: { plan: updated.planName, status: updated.status, billingCycle: updated.billingCycle, amount: updated.amount },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return toSubscriptionDTO(updated);
    });
  }
}

/** Renova por mais um ciclo (a partir do fim do período atual, ou de hoje se já expirou). */
export class RenewSubscriptionUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(id: string, context: ActorContext): Promise<SubscriptionDTO> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Subscrição', id);
    if (current.status === 'CANCELLED') throw new BusinessRuleError('Subscrições canceladas não podem ser renovadas.');

    const base = current.currentPeriodEnd.getTime() > Date.now() ? current.currentPeriodEnd : new Date();
    const currentPeriodEnd = addBillingPeriod(base, current.billingCycle);

    return this.unitOfWork.run(async () => {
      const updated = await this.repository.update(id, { status: 'ACTIVE', currentPeriodEnd });
      await this.auditRepository.log({
        userId: context.actorId,
        clientId: current.clientId,
        action: 'SUBSCRIPTION_RENEWED',
        entity: 'ClientSubscription',
        entityId: id,
        oldValues: { status: current.status, currentPeriodEnd: current.currentPeriodEnd.toISOString() },
        newValues: { status: 'ACTIVE', currentPeriodEnd: currentPeriodEnd.toISOString() },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return toSubscriptionDTO(updated);
    });
  }
}
