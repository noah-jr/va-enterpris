import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, ClientListItemDTO, ClientDTO } from '@accountable/types';
import { clientFilterSchema, blockClientSchema } from '@accountable/schemas';
import type {
  ListClientsUseCase,
  GetClientUseCase,
  BlockClientUseCase,
  UnblockClientUseCase,
} from '../../application/use-cases/clients/index.js';
import { UnauthorizedError } from '../../domain/errors/index.js';

export interface ClientControllerDependencies {
  listClientsUseCase: ListClientsUseCase;
  getClientUseCase: GetClientUseCase;
  blockClientUseCase: BlockClientUseCase;
  unblockClientUseCase: UnblockClientUseCase;
}

export class ClientController {
  constructor(private readonly deps: ClientControllerDependencies) {}

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

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = clientFilterSchema.parse(request.query);
    const result = await this.deps.listClientsUseCase.execute(query);
    reply.status(200).send(result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const client = await this.deps.getClientUseCase.execute(id);
    const response: ApiResponse<ClientDTO> = {
      data: client,
    };
    reply.status(200).send(response);
  }

  async block(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params as { id: string };
    const body = blockClientSchema.parse(request.body);

    const client = await this.deps.blockClientUseCase.execute(id, body, {
      actorId: auth.actorId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    const response: ApiResponse<ClientListItemDTO> = {
      data: client,
      message: 'Cliente bloqueado com sucesso.',
    };
    reply.status(200).send(response);
  }

  async unblock(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params as { id: string };

    const client = await this.deps.unblockClientUseCase.execute(id, {
      actorId: auth.actorId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    const response: ApiResponse<ClientListItemDTO> = {
      data: client,
      message: 'Cliente desbloqueado com sucesso.',
    };
    reply.status(200).send(response);
  }
}
