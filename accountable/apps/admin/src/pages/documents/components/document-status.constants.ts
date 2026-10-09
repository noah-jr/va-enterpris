import type { DocumentStatus } from '@accountable/types';

export const ALL_STATUSES: DocumentStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'IN_ANALYSIS',
  'AWAITING_DOCUMENT',
  'IN_PROCESSING',
  'REPLIED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'ARCHIVED',
];

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  DRAFT: 'Rascunho',
  SUBMITTED: 'Submetido',
  IN_ANALYSIS: 'Em análise',
  AWAITING_DOCUMENT: 'Aguarda documento',
  IN_PROCESSING: 'Em processamento',
  REPLIED: 'Respondido',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rejeitado',
  ARCHIVED: 'Arquivado',
};

/** Transições permitidas pela API (update-document-status.use-case.ts). */
export const NEXT_STATUSES: Record<DocumentStatus, DocumentStatus[]> = {
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
