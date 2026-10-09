import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CreateSubscriptionUseCase,
  RenewSubscriptionUseCase,
  UpdateSubscriptionUseCase,
  addBillingPeriod,
  monthlyRevenue,
  priceForCycle,
} from './subscriptions.use-cases.js';
import type {
  IPlanRepository,
  ISubscriptionRepository,
  PlanEntity,
  SubscriptionEntity,
} from '../../../domain/repositories/index.js';
import { BusinessRuleError, ConflictError, ValidationError } from '../../../domain/errors/index.js';
import {
  FakeUnitOfWork,
  buildClient,
  createAuditRepositoryMock,
  createClientRepositoryMock,
} from '../../../__tests__/unit/fakes.js';

function plan(overrides: Partial<PlanEntity> = {}): PlanEntity {
  const now = new Date();
  return {
    id: 'plan-pro',
    name: 'Profissional',
    badge: null,
    description: 'd',
    priceMonthly: 125_000,
    priceAnnual: 100_000,
    currency: 'AOA',
    features: [],
    ctaText: 'x',
    isPopular: false,
    isActive: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

function subscription(overrides: Partial<SubscriptionEntity> = {}): SubscriptionEntity {
  return {
    id: 'sub-1',
    clientId: 'c1',
    clientName: 'Cliente',
    clientEmail: 'c@x.ao',
    planId: 'plan-pro',
    planName: 'Profissional',
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    amount: 125_000,
    currency: 'AOA',
    startDate: new Date('2026-01-01T00:00:00Z'),
    currentPeriodEnd: new Date(Date.now() + 10 * 86_400_000),
    cancelledAt: null,
    notes: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('Regras de preço em AOA', () => {
  it('mensal = preço mensal; anual = preço mensal anual × 12', () => {
    expect(priceForCycle(plan(), 'MONTHLY')).toBe(125_000);
    expect(priceForCycle(plan(), 'ANNUAL')).toBe(1_200_000);
    expect(priceForCycle(plan({ priceMonthly: null, priceAnnual: null }), 'ANNUAL')).toBeNull();
  });

  it('MRR conta anuais como 1/12', () => {
    expect(monthlyRevenue({ amount: 125_000, billingCycle: 'MONTHLY' })).toBe(125_000);
    expect(monthlyRevenue({ amount: 1_200_000, billingCycle: 'ANNUAL' })).toBe(100_000);
  });

  it('períodos: +1 mês ou +12 meses', () => {
    const start = new Date('2026-03-15T00:00:00Z');
    expect(addBillingPeriod(start, 'MONTHLY').toISOString()).toBe('2026-04-15T00:00:00.000Z');
    expect(addBillingPeriod(start, 'ANNUAL').toISOString()).toBe('2027-03-15T00:00:00.000Z');
  });
});

describe('Subscrições — casos de uso', () => {
  let repo: ISubscriptionRepository;
  let plans: IPlanRepository;
  const clients = createClientRepositoryMock();

  beforeEach(() => {
    repo = {
      create: vi.fn(async (data) => subscription({ ...data, id: 'new' })),
      findById: vi.fn(async () => subscription()),
      findOpenByClient: vi.fn(async () => null),
      list: vi.fn(),
      update: vi.fn(async (_id, data) => subscription(data)),
    };
    plans = { findById: vi.fn(async (id: string) => (id === 'plan-ent' ? plan({ id, name: 'Enterprise', priceMonthly: null, priceAnnual: null }) : plan({ id }))) } as unknown as IPlanRepository;
    vi.mocked(clients.findById).mockResolvedValue(buildClient({ id: 'c1' }));
  });

  const create = () => new CreateSubscriptionUseCase(repo, clients, plans, createAuditRepositoryMock(), new FakeUnitOfWork());
  const ctx = { actorId: 'admin-1' };

  it('cria subscrição anual com o valor do plano em AOA e fim do período a +12 meses', async () => {
    await create().execute(
      { clientId: 'c1', planId: 'plan-pro', billingCycle: 'ANNUAL', status: 'ACTIVE', startDate: '2026-01-01T00:00:00Z' },
      ctx,
    );
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1_200_000, currentPeriodEnd: new Date('2027-01-01T00:00:00Z') }),
    );
  });

  it('plano sem preço (Enterprise) exige valor acordado', async () => {
    await expect(
      create().execute({ clientId: 'c1', planId: 'plan-ent', billingCycle: 'MONTHLY', status: 'ACTIVE' }, ctx),
    ).rejects.toThrow(ValidationError);

    await create().execute({ clientId: 'c1', planId: 'plan-ent', billingCycle: 'MONTHLY', status: 'ACTIVE', customAmount: 900_000 }, ctx);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 900_000 }));
  });

  it('um cliente só tem uma subscrição em curso', async () => {
    vi.mocked(repo.findOpenByClient).mockResolvedValueOnce(subscription());
    await expect(
      create().execute({ clientId: 'c1', planId: 'plan-pro', billingCycle: 'MONTHLY', status: 'ACTIVE' }, ctx),
    ).rejects.toThrow(ConflictError);
  });

  it('não subscreve clientes bloqueados nem planos inativos', async () => {
    vi.mocked(clients.findById).mockResolvedValueOnce(buildClient({ isActive: false }));
    await expect(create().execute({ clientId: 'c1', planId: 'plan-pro', billingCycle: 'MONTHLY', status: 'ACTIVE' }, ctx)).rejects.toThrow(BusinessRuleError);

    vi.mocked(plans.findById).mockResolvedValueOnce(plan({ isActive: false }));
    await expect(create().execute({ clientId: 'c1', planId: 'plan-pro', billingCycle: 'MONTHLY', status: 'ACTIVE' }, ctx)).rejects.toThrow(/inativo/);
  });

  it('transições: cancelada é terminal; ACTIVE→TRIAL é inválida; cancelar regista a data', async () => {
    const update = new UpdateSubscriptionUseCase(repo, plans, createAuditRepositoryMock(), new FakeUnitOfWork());

    await expect(update.execute('sub-1', { status: 'TRIAL' }, ctx)).rejects.toThrow(/Transição inválida/);

    await update.execute('sub-1', { status: 'CANCELLED' }, ctx);
    expect(repo.update).toHaveBeenCalledWith('sub-1', expect.objectContaining({ status: 'CANCELLED', cancelledAt: expect.any(Date) }));

    vi.mocked(repo.findById).mockResolvedValueOnce(subscription({ status: 'CANCELLED' }));
    await expect(update.execute('sub-1', { status: 'ACTIVE' }, ctx)).rejects.toThrow(/canceladas/);
  });

  it('mudar de ciclo recalcula o valor pelo plano', async () => {
    const update = new UpdateSubscriptionUseCase(repo, plans, createAuditRepositoryMock(), new FakeUnitOfWork());
    await update.execute('sub-1', { billingCycle: 'ANNUAL' }, ctx);
    expect(repo.update).toHaveBeenCalledWith('sub-1', expect.objectContaining({ billingCycle: 'ANNUAL', amount: 1_200_000 }));
  });

  it('renovar estende a partir do fim do período (ou de hoje, se já expirou) e reativa', async () => {
    const renew = new RenewSubscriptionUseCase(repo, createAuditRepositoryMock(), new FakeUnitOfWork());
    const end = new Date(Date.now() + 5 * 86_400_000);
    vi.mocked(repo.findById).mockResolvedValueOnce(subscription({ status: 'PAST_DUE', currentPeriodEnd: end }));

    await renew.execute('sub-1', ctx);
    expect(repo.update).toHaveBeenCalledWith('sub-1', { status: 'ACTIVE', currentPeriodEnd: addBillingPeriod(end, 'MONTHLY') });

    vi.mocked(repo.findById).mockResolvedValueOnce(subscription({ currentPeriodEnd: new Date('2020-01-01T00:00:00Z') }));
    await renew.execute('sub-1', ctx);
    const newEnd = vi.mocked(repo.update).mock.calls[1]![1].currentPeriodEnd!;
    expect(newEnd.getTime()).toBeGreaterThan(Date.now() + 27 * 86_400_000);
  });
});
