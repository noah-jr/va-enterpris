import type { DocumentPriority } from '@accountable/types';
import type {
  IDocumentRepository,
  IDocumentStatusHistoryRepository,
  DocumentEntity,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError, BusinessRuleError } from '../../../domain/errors/index.js';
import type { IUnitOfWork } from '../../contracts/index.js';

export interface CreateDocumentInput {
  clientId: string;
  title: string;
  description?: string;
  type: string;
  priority?: DocumentPriority;
  submitImmediately?: boolean;
}

export class CreateDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly statusHistoryRepository: IDocumentStatusHistoryRepository,
    private readonly clientRepository: IClientRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: CreateDocumentInput,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<DocumentEntity> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new NotFoundError('Cliente', input.clientId);
    }

    if (!client.isActive) {
      throw new BusinessRuleError('Não é possível criar documentos para um cliente inativo.');
    }

    // Security: if client is creating, actorId must match clientId
    if (context.actorType === 'client' && context.actorId !== input.clientId) {
      throw new BusinessRuleError('Acesso não autorizado para criar documento para este cliente.');
    }

    const priority: DocumentPriority = input.priority ?? 'NORMAL';

    return this.unitOfWork.run(async () => {
      const document = await this.documentRepository.create({
        clientId: input.clientId,
        title: input.title,
        description: input.description,
        type: input.type,
        priority,
        status: input.submitImmediately ? 'SUBMITTED' : 'DRAFT',
      });

      // Registar histórico de estado
      await this.statusHistoryRepository.create({
        documentId: document.id,
        fromStatus: null,
        toStatus: document.status,
        changedById: context.actorId,
        note: input.submitImmediately ? 'Processo criado e submetido' : 'Rascunho inicial criado',
      });

      // Auditoria
      await this.auditRepository.log({
        ...(context.actorType === 'client'
          ? { clientId: context.actorId }
          : { userId: context.actorId }),
        action: 'DOCUMENT_CREATED',
        entity: 'Document',
        entityId: document.id,
        newValues: {
          title: document.title,
          type: document.type,
          priority: document.priority,
          status: document.status,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return document;
    });
  }
}
