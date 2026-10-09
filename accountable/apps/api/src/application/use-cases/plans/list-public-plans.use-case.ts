import type { IPlanRepository } from '../../../domain/repositories/plan.repository.interface.js';
import type { PlanDTO } from '@accountable/types';
import { toPlanDTO } from './plan.mapper.js';

export class ListPublicPlansUseCase {
  constructor(private readonly planRepository: IPlanRepository) {}

  async execute(): Promise<PlanDTO[]> {
    const plans = await this.planRepository.findAllActive();
    return plans.map(toPlanDTO);
  }
}
