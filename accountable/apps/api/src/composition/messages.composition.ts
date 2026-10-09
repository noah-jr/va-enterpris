import { SendMessageUseCase, ListMessagesUseCase } from '../application/use-cases/messages/index.js';
import { MessageController } from '../presentation/controllers/message.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildMessageController(infra: Infrastructure): MessageController {
  const { documentRepository, messageRepository, auditRepository, notificationRepository } =
    infra.repositories;

  const sendMessageUseCase = new SendMessageUseCase(
    messageRepository,
    documentRepository,
    auditRepository,
    notificationRepository,
    infra.unitOfWork,
  );
  const listMessagesUseCase = new ListMessagesUseCase(messageRepository, documentRepository);

  return new MessageController({ sendMessageUseCase, listMessagesUseCase });
}
