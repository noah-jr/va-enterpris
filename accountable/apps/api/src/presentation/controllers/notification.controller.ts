import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, PaginatedResponse } from '@accountable/types';
import { paginationSchema } from '@accountable/schemas';
import type {
  ListNotificationsUseCase,
  MarkNotificationReadUseCase,
} from '../../application/use-cases/notifications/index.js';
import type { NotificationEntity } from '../../domain/repositories/notification.repository.interface.js';
import { UnauthorizedError } from '../../domain/errors/index.js';

export interface NotificationControllerDependencies {
  listNotificationsUseCase: ListNotificationsUseCase;
  markNotificationReadUseCase: MarkNotificationReadUseCase;
}

export class NotificationController {
  constructor(private readonly deps: NotificationControllerDependencies) {}

  private getAuthContext(request: FastifyRequest) {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    return { actorId: request.auth.sub, actorType: request.auth.type };
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const query = paginationSchema.parse(request.query);

    const result: PaginatedResponse<NotificationEntity> = await this.deps.listNotificationsUseCase.execute(
      { page: query.page, perPage: query.perPage },
      auth,
    );

    reply.status(200).send(result);
  }

  async markRead(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;

    const updated = await this.deps.markNotificationReadUseCase.execute(id, auth);

    const response: ApiResponse<NotificationEntity> = { data: updated };

    reply.status(200).send(response);
  }
}
