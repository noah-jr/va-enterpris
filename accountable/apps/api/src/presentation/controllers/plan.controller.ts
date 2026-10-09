import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, PlanDTO } from '@accountable/types';
import { createPlanSchema, updatePlanSchema } from '@accountable/schemas';
import type {
  ListPublicPlansUseCase,
  ListAllPlansUseCase,
  CreatePlanUseCase,
  UpdatePlanUseCase,
  DeletePlanUseCase,
} from '../../application/use-cases/plans/index.js';
import { UnauthorizedError } from '../../domain/errors/index.js';

export interface PlanControllerDependencies {
  listPublicPlansUseCase: ListPublicPlansUseCase;
  listAllPlansUseCase: ListAllPlansUseCase;
  createPlanUseCase: CreatePlanUseCase;
  updatePlanUseCase: UpdatePlanUseCase;
  deletePlanUseCase: DeletePlanUseCase;
}

export class PlanController {
  constructor(private readonly deps: PlanControllerDependencies) {}

  private getAuthContext(request: FastifyRequest) {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    return {
      actorId: request.auth.sub,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }

  async listPublic(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const plans = await this.deps.listPublicPlansUseCase.execute();
    const response: ApiResponse<PlanDTO[]> = { data: plans };
    reply.status(200).send(response);
  }

  async listAll(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const plans = await this.deps.listAllPlansUseCase.execute();
    const response: ApiResponse<PlanDTO[]> = { data: plans };
    reply.status(200).send(response);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const body = createPlanSchema.parse(request.body);

    const plan = await this.deps.createPlanUseCase.execute(body, {
      actorId: auth.actorId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    const response: ApiResponse<PlanDTO> = { data: plan, message: 'Plano criado com sucesso.' };
    reply.status(201).send(response);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params as { id: string };
    const body = updatePlanSchema.parse(request.body);

    const plan = await this.deps.updatePlanUseCase.execute(id, body, {
      actorId: auth.actorId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    const response: ApiResponse<PlanDTO> = { data: plan, message: 'Plano atualizado com sucesso.' };
    reply.status(200).send(response);
  }

  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params as { id: string };

    await this.deps.deletePlanUseCase.execute(id, {
      actorId: auth.actorId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    reply.status(204).send();
  }
}
