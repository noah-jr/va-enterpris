import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, PaginatedResponse } from '@accountable/types';
import {
  createTicketSchema,
  sendTicketMessageSchema,
  updateTicketStatusSchema,
  ticketFilterSchema,
} from '@accountable/schemas';
import type {
  CreateTicketUseCase,
  ListTicketsUseCase,
  GetTicketUseCase,
  ReplyTicketUseCase,
  UpdateTicketStatusUseCase,
  TicketDetailsOutput,
} from '../../application/use-cases/tickets/index.js';
import type {
  TicketEntity,
  TicketMessageEntity,
} from '../../domain/repositories/ticket.repository.interface.js';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/index.js';

export interface TicketControllerDependencies {
  createTicketUseCase: CreateTicketUseCase;
  listTicketsUseCase: ListTicketsUseCase;
  getTicketUseCase: GetTicketUseCase;
  replyTicketUseCase: ReplyTicketUseCase;
  updateTicketStatusUseCase: UpdateTicketStatusUseCase;
}

export class TicketController {
  constructor(private readonly deps: TicketControllerDependencies) {}

  private getAuthContext(request: FastifyRequest) {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    return {
      actorId: request.auth.sub,
      actorType: request.auth.type,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    if (auth.actorType !== 'client') {
      throw new ForbiddenError('Apenas clientes podem criar tickets.');
    }
    const body = createTicketSchema.parse(request.body);

    const ticket = await this.deps.createTicketUseCase.execute(
      { clientId: auth.actorId, ...body },
      auth,
    );

    const response: ApiResponse<TicketEntity> = {
      data: ticket,
      message: 'Ticket criado com sucesso.',
    };

    reply.status(201).send(response);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const filter = ticketFilterSchema.parse(request.query);

    const result: PaginatedResponse<TicketEntity> = await this.deps.listTicketsUseCase.execute(
      {
        page: filter.page,
        perPage: filter.perPage,
        status: filter.status,
        priority: filter.priority,
        clientId: filter.clientId,
      },
      auth,
    );

    reply.status(200).send(result);
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;

    const details = await this.deps.getTicketUseCase.execute(id, auth);

    const response: ApiResponse<TicketDetailsOutput> = { data: details };

    reply.status(200).send(response);
  }

  async reply(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;
    const body = sendTicketMessageSchema.parse(request.body);

    const message = await this.deps.replyTicketUseCase.execute(
      { ticketId: id, content: body.content },
      auth,
    );

    const response: ApiResponse<TicketMessageEntity> = {
      data: message,
      message: 'Resposta enviada com sucesso.',
    };

    reply.status(201).send(response);
  }

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;
    const body = updateTicketStatusSchema.parse(request.body);

    const updated = await this.deps.updateTicketStatusUseCase.execute(
      { ticketId: id, toStatus: body.status },
      auth,
    );

    const response: ApiResponse<TicketEntity> = {
      data: updated,
      message: 'Estado do ticket atualizado com sucesso.',
    };

    reply.status(200).send(response);
  }
}
