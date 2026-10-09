import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IPlanRepository } from '../../../domain/repositories/plan.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError } from '../../../domain/errors/index.js';

export class DeletePlanUseCase {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    id: string,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Plano', id);
    }

    return this.unitOfWork.run(async () => {
      await this.planRepository.softDelete(id);

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'PLAN_DELETED',
        entity: 'Plan',
        entityId: id,
        oldValues: { name: existing.name },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    });
  }
}
