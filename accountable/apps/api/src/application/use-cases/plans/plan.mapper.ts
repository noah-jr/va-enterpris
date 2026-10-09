import type { PlanEntity } from '../../../domain/repositories/plan.repository.interface.js';
import type { PlanDTO } from '@accountable/types';

export function toPlanDTO(plan: PlanEntity): PlanDTO {
  return {
    id: plan.id,
    name: plan.name,
    badge: plan.badge,
    description: plan.description,
    priceMonthly: plan.priceMonthly,
    priceAnnual: plan.priceAnnual,
    currency: plan.currency,
    features: plan.features,
    ctaText: plan.ctaText,
    isPopular: plan.isPopular,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}
