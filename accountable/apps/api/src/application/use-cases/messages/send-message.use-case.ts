import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type {
  IMessageRepository,
  MessageEntity,
} from '../../../domain/repositories/message.repository.interface.js';
import type { IDocumentRepository } from '../../../domain/repositories/document.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository.interface.js';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../../../domain/errors/index.js';

export interface SendMessageInput {
  documentId: string;
  content: string;
  isInternal?: boolean;
}

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly documentRepository: IDocumentRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: SendMessageInput,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<MessageEntity> {
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento', input.documentId);
    }

    if (context.actorType === 'client' && document.clientId !== context.actorId) {
      throw new ForbiddenError('Acesso não autorizado a este documento.');
    }

    if (context.actorType === 'client' && input.isInternal) {
      throw new BusinessRuleError('Clientes não podem criar notas internas.');
    }

    return this.unitOfWork.run(async () => {
      const message = await this.messageRepository.create({
        documentId: input.documentId,
        senderId: context.actorId,
        senderType: context.actorType === 'client' ? 'CLIENT' : 'USER',
        content: input.content,
        isInternal: input.isInternal ?? false,
      });

      if (!message.isInternal && context.actorType === 'user') {
        await this.notificationRepository.create({
          recipientId: document.clientId,
          recipientType: 'CLIENT',
          type: 'MESSAGE_RECEIVED',
          title: 'Nova mensagem no seu processo',
          body: message.content.slice(0, 200),
          metadata: { documentId: document.id, messageId: message.id },
        });
      }

      await this.auditRepository.log({
        ...(context.actorType === 'client'
          ? { clientId: context.actorId }
          : { userId: context.actorId }),
        action: 'MESSAGE_SENT',
        entity: 'Message',
        entityId: message.id,
        newValues: { documentId: document.id, isInternal: message.isInternal },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return message;
    });
  }
}
