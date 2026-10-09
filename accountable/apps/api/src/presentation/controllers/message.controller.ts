import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, PaginatedResponse } from '@accountable/types';
import { sendMessageSchema, paginationSchema } from '@accountable/schemas';
import type { SendMessageUseCase, ListMessagesUseCase } from '../../application/use-cases/messages/index.js';
import type { MessageEntity } from '../../domain/repositories/message.repository.interface.js';
import { UnauthorizedError } from '../../domain/errors/index.js';

export interface MessageControllerDependencies {
  sendMessageUseCase: SendMessageUseCase;
  listMessagesUseCase: ListMessagesUseCase;
}

export class MessageController {
  constructor(private readonly deps: MessageControllerDependencies) {}

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

  async send(
    request: FastifyRequest<{ Params: { documentId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { documentId } = request.params;
    const body = sendMessageSchema.parse(request.body);

    const message = await this.deps.sendMessageUseCase.execute(
      { documentId, content: body.content, isInternal: body.isInternal },
      auth,
    );

    const response: ApiResponse<MessageEntity> = {
      data: message,
      message: 'Mensagem enviada com sucesso.',
    };

    reply.status(201).send(response);
  }

  async list(
    request: FastifyRequest<{ Params: { documentId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { documentId } = request.params;
    const query = paginationSchema.parse(request.query);

    const result: PaginatedResponse<MessageEntity> = await this.deps.listMessagesUseCase.execute(
      { documentId, page: query.page, perPage: query.perPage },
      auth,
    );

    reply.status(200).send(result);
  }
}
