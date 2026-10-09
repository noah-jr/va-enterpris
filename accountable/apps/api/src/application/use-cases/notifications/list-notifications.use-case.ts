import type { PaginatedResponse } from '@accountable/types';
import type {
  INotificationRepository,
  NotificationEntity,
} from '../../../domain/repositories/notification.repository.interface.js';

export interface ListNotificationsInput {
  page?: number;
  perPage?: number;
}

export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    input: ListNotificationsInput,
    context: { actorId: string; actorType: 'client' | 'user' },
  ): Promise<PaginatedResponse<NotificationEntity>> {
    const page = Math.max(1, input.page ?? 1);
    const perPage = Math.min(100, Math.max(1, input.perPage ?? 20));

    const { items, total } = await this.notificationRepository.listForRecipient({
      recipientId: context.actorId,
      recipientType: context.actorType === 'client' ? 'CLIENT' : 'USER',
      page,
      perPage,
    });

    return {
      data: items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
