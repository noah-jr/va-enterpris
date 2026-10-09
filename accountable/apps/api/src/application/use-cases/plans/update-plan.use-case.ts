import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IPlanRepository } from '../../../domain/repositories/plan.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { PlanDTO } from '@accountable/types';
import type { UpdatePlanInput } from '@accountable/schemas';
import { NotFoundError } from '../../../domain/errors/index.js';
import { toPlanDTO } from './plan.mapper.js';

export class UpdatePlanUseCase {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    id: string,
    input: UpdatePlanInput,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<PlanDTO> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Plano', id);
    }

    return this.unitOfWork.run(async () => {
      const updated = await this.planRepository.update(id, input);

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'PLAN_UPDATED',
        entity: 'Plan',
        entityId: updated.id,
        oldValues: { name: existing.name, isActive: existing.isActive, sortOrder: existing.sortOrder },
        newValues: { name: updated.name, isActive: updated.isActive, sortOrder: updated.sortOrder },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return toPlanDTO(updated);
    });
  }
}
