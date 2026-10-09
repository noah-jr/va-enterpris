import {
  ListNotificationsUseCase,
  MarkNotificationReadUseCase,
} from '../application/use-cases/notifications/index.js';
import { NotificationController } from '../presentation/controllers/notification.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildNotificationController(infra: Infrastructure): NotificationController {
  const { notificationRepository } = infra.repositories;

  const listNotificationsUseCase = new ListNotificationsUseCase(notificationRepository);
  const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);

  return new NotificationController({ listNotificationsUseCase, markNotificationReadUseCase });
}
