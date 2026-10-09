import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IPlanRepository } from '../../../domain/repositories/plan.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { PlanDTO } from '@accountable/types';
import type { CreatePlanInput } from '@accountable/schemas';
import { toPlanDTO } from './plan.mapper.js';

export class CreatePlanUseCase {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: CreatePlanInput,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<PlanDTO> {
    return this.unitOfWork.run(async () => {
      const plan = await this.planRepository.create({
        name: input.name,
        badge: input.badge ?? null,
        description: input.description,
        priceMonthly: input.priceMonthly ?? null,
        priceAnnual: input.priceAnnual ?? null,
        currency: input.currency,
        features: input.features,
        ctaText: input.ctaText,
        isPopular: input.isPopular,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      });

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'PLAN_CREATED',
        entity: 'Plan',
        entityId: plan.id,
        newValues: { name: plan.name, isActive: plan.isActive },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return toPlanDTO(plan);
    });
  }
}
