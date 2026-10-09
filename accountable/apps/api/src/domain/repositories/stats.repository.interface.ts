import type { BillingCycle, SubscriptionStatus } from '@accountable/types';

export interface IStatsRepository {
  countClients(): Promise<{ total: number; active: number }>;
  countClientsCreatedSince(from: Date): Promise<number>;
  clientsCreatedPerMonth(from: Date): Promise<Array<{ month: string; count: number }>>;
  documentsCreatedPerMonth(from: Date): Promise<Array<{ month: string; count: number }>>;
  documentsCompletedPerMonth(from: Date): Promise<Array<{ month: string; count: number }>>;
  documentsByStatus(): Promise<Array<{ status: string; count: number }>>;
  countOpenTickets(): Promise<number>;
  subscriptionsByStatus(): Promise<Array<{ status: SubscriptionStatus; count: number }>>;
  activeSubscriptionAmounts(): Promise<Array<{ amount: number; billingCycle: BillingCycle }>>;
}
