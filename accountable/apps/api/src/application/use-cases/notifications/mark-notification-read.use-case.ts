import type {
  INotificationRepository,
  NotificationEntity,
} from '../../../domain/repositories/notification.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/index.js';

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    notificationId: string,
    context: { actorId: string; actorType: 'client' | 'user' },
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notificação', notificationId);
    }

    const expectedType = context.actorType === 'client' ? 'CLIENT' : 'USER';
    if (notification.recipientId !== context.actorId || notification.recipientType !== expectedType) {
      throw new ForbiddenError('Acesso não autorizado a esta notificação.');
    }

    return this.notificationRepository.markRead(notificationId);
  }
}
