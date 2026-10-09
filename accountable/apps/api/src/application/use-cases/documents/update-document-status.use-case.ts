import type { DocumentStatus } from '@accountable/types';
import type {
  IDocumentRepository,
  IDocumentStatusHistoryRepository,
  DocumentEntity,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IEmailService } from '../../contracts/email.contract.js';
import {
  NotFoundError,
  BusinessRuleError,
  ForbiddenError,
} from '../../../domain/errors/index.js';
import type { IUnitOfWork } from '../../contracts/index.js';

const ALLOWED_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['IN_ANALYSIS', 'REJECTED', 'CANCELLED'],
  IN_ANALYSIS: ['AWAITING_DOCUMENT', 'IN_PROCESSING', 'REJECTED', 'CANCELLED'],
  AWAITING_DOCUMENT: ['IN_ANALYSIS', 'IN_PROCESSING', 'CANCELLED'],
  IN_PROCESSING: ['REPLIED', 'COMPLETED', 'AWAITING_DOCUMENT', 'CANCELLED'],
  REPLIED: ['COMPLETED', 'IN_ANALYSIS', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED'],
  ARCHIVED: [],
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  DRAFT: 'Rascunho',
  SUBMITTED: 'Submetido',
  IN_ANALYSIS: 'Em Análise',
  AWAITING_DOCUMENT: 'Aguardando Documento',
  IN_PROCESSING: 'Em Processamento',
  REPLIED: 'Respondido',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rejeitado',
  ARCHIVED: 'Arquivado',
};

export interface UpdateDocumentStatusInput {
  documentId: string;
  toStatus: DocumentStatus;
  note?: string;
}

export class UpdateDocumentStatusUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly statusHistoryRepository: IDocumentStatusHistoryRepository,
    private readonly clientRepository: IClientRepository,
    private readonly emailService: IEmailService,
    private readonly auditRepository: IAuditRepository,
    private readonly appUrl: string,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: UpdateDocumentStatusInput,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<DocumentEntity> {
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento', input.documentId);
    }

    // Regras de autorização por ator
    if (context.actorType === 'client') {
      if (document.clientId !== context.actorId) {
        throw new ForbiddenError('Acesso não autorizado a este documento.');
      }
      // Cliente só pode submeter rascunho ou cancelar
      const allowedClientTransitions: DocumentStatus[] = ['SUBMITTED', 'CANCELLED'];
      if (!allowedClientTransitions.includes(input.toStatus)) {
        throw new BusinessRuleError(
          'Clientes apenas podem submeter rascunhos ou cancelar os seus processos.',
        );
      }
    }

    const currentStatus = document.status;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];

    if (!allowedNext.includes(input.toStatus)) {
      throw new BusinessRuleError(
        `Transição de estado inválida: não é permitido alterar de '${STATUS_LABELS[currentStatus]}' para '${STATUS_LABELS[input.toStatus]}'.`,
      );
    }

    const actor =
      context.actorType === 'client' ? { clientId: context.actorId } : { userId: context.actorId };

    const updatedDocument = await this.unitOfWork.run(async () => {
      const updated = await this.documentRepository.update(document.id, {
        status: input.toStatus,
      });

      await this.statusHistoryRepository.create({
        documentId: document.id,
        fromStatus: currentStatus,
        toStatus: input.toStatus,
        changedById: context.actorId,
        note: input.note,
      });

      await this.auditRepository.log({
        ...actor,
        action: 'DOCUMENT_STATUS_CHANGED',
        entity: 'Document',
        entityId: document.id,
        oldValues: { status: currentStatus },
        newValues: { status: input.toStatus, note: input.note },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return updated;
    });

    // Notificação por email só depois do commit; uma falha no envio não reverte a alteração.
    const client = await this.clientRepository.findById(document.clientId);
    if (client && client.email) {
      try {
        await this.emailService.sendDocumentStatusChanged({
          to: client.email,
          name: client.name,
          documentTitle: document.title,
          newStatus: STATUS_LABELS[input.toStatus] || input.toStatus,
          platformUrl: `${this.appUrl}/documents/${document.id}`,
        });
      } catch (err) {
        await this.auditRepository.log({
          ...actor,
          action: 'DOCUMENT_STATUS_CHANGED',
          entity: 'Document',
          entityId: document.id,
          metadata: {
            emailError: err instanceof Error ? err.message : String(err),
            emailTarget: client.email,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }
    }

    return updatedDocument;
  }
}
