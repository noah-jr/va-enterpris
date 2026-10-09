import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ApiResponse, EmailSettingsDTO, StatsOverviewDTO, SubscriptionDTO } from '@accountable/types';
import {
  createSubscriptionSchema,
  emailSettingsSchema,
  subscriptionFilterSchema,
  testEmailSchema,
  updateSubscriptionSchema,
} from '@accountable/schemas';
import type {
  GetEmailSettingsUseCase,
  SendTestEmailUseCase,
  UpdateEmailSettingsUseCase,
} from '../../application/use-cases/settings/index.js';
import type {
  CreateSubscriptionUseCase,
  GetClientSubscriptionUseCase,
  ListSubscriptionsUseCase,
  RenewSubscriptionUseCase,
  UpdateSubscriptionUseCase,
} from '../../application/use-cases/subscriptions/index.js';
import type { GetStatsOverviewUseCase } from '../../application/use-cases/stats/index.js';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/index.js';

function actor(request: FastifyRequest) {
  if (!request.auth) throw new UnauthorizedError('Autenticação necessária');
  return {
    actorId: request.auth.sub,
    actorEmail: request.auth.email,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  };
}

// ============================================================
export class EmailSettingsController {
  constructor(
    private readonly deps: {
      getEmailSettingsUseCase: GetEmailSettingsUseCase;
      updateEmailSettingsUseCase: UpdateEmailSettingsUseCase;
      sendTestEmailUseCase: SendTestEmailUseCase;
    },
  ) {}

  async get(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response: ApiResponse<EmailSettingsDTO> = { data: await this.deps.getEmailSettingsUseCase.execute() };
    reply.status(200).send(response);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = emailSettingsSchema.parse(request.body);
    const saved = await this.deps.updateEmailSettingsUseCase.execute(body, actor(request));
    const response: ApiResponse<EmailSettingsDTO> = { data: saved, message: 'Configuração de email guardada.' };
    reply.status(200).send(response);
  }

  async test(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = testEmailSchema.parse(request.body);
    const result = await this.deps.sendTestEmailUseCase.execute(body, actor(request));
    const response: ApiResponse<typeof result> = {
      data: result,
      message: result.success
        ? `Email de teste enviado para ${body.to}.`
        : 'Não foi possível enviar o email de teste. Verifique a configuração.',
    };
    reply.status(result.success ? 200 : 502).send(response);
  }
}

// ============================================================
export class SubscriptionController {
  constructor(
    private readonly deps: {
      listSubscriptionsUseCase: ListSubscriptionsUseCase;
      createSubscriptionUseCase: CreateSubscriptionUseCase;
      updateSubscriptionUseCase: UpdateSubscriptionUseCase;
      renewSubscriptionUseCase: RenewSubscriptionUseCase;
      getClientSubscriptionUseCase: GetClientSubscriptionUseCase;
    },
  ) {}

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const filter = subscriptionFilterSchema.parse(request.query);
    reply.status(200).send(await this.deps.listSubscriptionsUseCase.execute(filter));
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = createSubscriptionSchema.parse(request.body);
    const created = await this.deps.createSubscriptionUseCase.execute(body, actor(request));
    const response: ApiResponse<SubscriptionDTO> = { data: created, message: 'Subscrição criada.' };
    reply.status(201).send(response);
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const body = updateSubscriptionSchema.parse(request.body);
    const updated = await this.deps.updateSubscriptionUseCase.execute(request.params.id, body, actor(request));
    const response: ApiResponse<SubscriptionDTO> = { data: updated, message: 'Subscrição atualizada.' };
    reply.status(200).send(response);
  }

  async renew(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const renewed = await this.deps.renewSubscriptionUseCase.execute(request.params.id, actor(request));
    const response: ApiResponse<SubscriptionDTO> = { data: renewed, message: 'Subscrição renovada.' };
    reply.status(200).send(response);
  }

  /** Cliente autenticado vê a sua própria subscrição. */
  async mine(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.auth) throw new UnauthorizedError('Autenticação necessária');
    if (request.auth.type !== 'client') throw new ForbiddenError('Disponível apenas para clientes.');
    const response: ApiResponse<SubscriptionDTO | null> = {
      data: await this.deps.getClientSubscriptionUseCase.execute(request.auth.sub),
    };
    reply.status(200).send(response);
  }
}

// ============================================================
export class StatsController {
  constructor(private readonly deps: { getStatsOverviewUseCase: GetStatsOverviewUseCase }) {}

  async overview(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response: ApiResponse<StatsOverviewDTO> = { data: await this.deps.getStatsOverviewUseCase.execute() };
    reply.status(200).send(response);
  }
}
