import type { BillingCycle, SubscriptionStatus } from '@accountable/types';

export interface SubscriptionEntity {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  startDate: Date;
  currentPeriodEnd: Date;
  cancelledAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface CreateSubscriptionData {
  clientId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  startDate: Date;
  currentPeriodEnd: Date;
  notes: string | null;
  createdById: string;
}

export type UpdateSubscriptionData = Partial<
  Pick<SubscriptionEntity, 'planId' | 'status' | 'billingCycle' | 'amount' | 'currentPeriodEnd' | 'cancelledAt' | 'notes'>
>;

export interface ISubscriptionRepository {
  create(data: CreateSubscriptionData): Promise<SubscriptionEntity>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  /** Subscrição não cancelada do cliente (no máximo uma). */
  findOpenByClient(clientId: string): Promise<SubscriptionEntity | null>;
  list(params: { page: number; perPage: number; status?: SubscriptionStatus; clientId?: string }): Promise<{
    items: SubscriptionEntity[];
    total: number;
  }>;
  update(id: string, data: UpdateSubscriptionData): Promise<SubscriptionEntity>;
}
