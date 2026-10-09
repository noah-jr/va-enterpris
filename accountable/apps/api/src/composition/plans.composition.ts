import {
  ListPublicPlansUseCase,
  ListAllPlansUseCase,
  CreatePlanUseCase,
  UpdatePlanUseCase,
  DeletePlanUseCase,
} from '../application/use-cases/plans/index.js';
import { PlanController } from '../presentation/controllers/plan.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildPlanController(infra: Infrastructure): PlanController {
  const { planRepository, auditRepository } = infra.repositories;

  const listPublicPlansUseCase = new ListPublicPlansUseCase(planRepository);
  const listAllPlansUseCase = new ListAllPlansUseCase(planRepository);
  const createPlanUseCase = new CreatePlanUseCase(planRepository, auditRepository, infra.unitOfWork);
  const updatePlanUseCase = new UpdatePlanUseCase(planRepository, auditRepository, infra.unitOfWork);
  const deletePlanUseCase = new DeletePlanUseCase(planRepository, auditRepository, infra.unitOfWork);

  return new PlanController({
    listPublicPlansUseCase,
    listAllPlansUseCase,
    createPlanUseCase,
    updatePlanUseCase,
    deletePlanUseCase,
  });
}
