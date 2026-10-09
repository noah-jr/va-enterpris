// ============================================================
// Document types
// ============================================================

export type DocumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_ANALYSIS'
  | 'AWAITING_DOCUMENT'
  | 'IN_PROCESSING'
  | 'REPLIED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'ARCHIVED';

export type DocumentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface DocumentDTO {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  type: string;
  priority: DocumentPriority;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentWithRelationsDTO extends DocumentDTO {
  client: {
    id: string;
    name: string;
    email: string;
    nip: string;
  };
  assignedTo: Array<{
    id: string;
    email: string;
  }>;
  filesCount: number;
  messagesCount: number;
}

export interface CreateDocumentDTO {
  title: string;
  description?: string;
  type: string;
  priority?: DocumentPriority;
}

export interface UpdateDocumentStatusDTO {
  status: DocumentStatus;
  note?: string;
}

// ============================================================
// Document Status History
// ============================================================

export interface DocumentStatusHistoryDTO {
  id: string;
  documentId: string;
  fromStatus: DocumentStatus | null;
  toStatus: DocumentStatus;
  note: string | null;
  createdAt: string;
}

// ============================================================
// Document Requests (solicitar documentos adicionais)
// ============================================================

export interface DocumentRequestDTO {
  id: string;
  documentId: string;
  label: string;
  description: string | null;
  required: boolean;
  fulfilledAt: string | null;
  createdAt: string;
}

export interface CreateDocumentRequestDTO {
  documentId: string;
  items: Array<{
    label: string;
    description?: string;
    required?: boolean;
  }>;
}

// ============================================================
// Document OCR and Decision Analysis
// ============================================================

export interface DocumentOcrDecision {
  suggestedStatus: DocumentStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  suggestedNote: string;
  complianceFlags: string[];
  isNifMatchingClient: boolean;
  typeMatchScore: number;
}

// ============================================================
// Document Upload Links (passwordless upload)
// ============================================================

export interface DocumentUploadLinkDTO {
  id: string;
  token?: string;
  url?: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface PublicUploadContextDTO {
  documentTitle: string;
  documentType: string;
  documentStatus: DocumentStatus;
  clientName: string;
  existingFiles: Array<{
    originalName: string;
    createdAt: string;
  }>;
}

export interface DocumentOcrResult {
  documentId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedText: string;
  characterCount: number;
  wordCount: number;
  pageCount?: number;
  detectedDocumentType: string;
  detectedEntities: string[];
  detectedNifs: string[];
  detectedDates: string[];
  detectedAmounts: string[];
  confidenceScore: number;
  decisionRecommendation: DocumentOcrDecision;
  processedAt: string;
}

// ============================================================
// Client Upload Sessions (bulk period-based upload like libera.ao)
// ============================================================

export interface ClientUploadSessionDTO {
  id: string;
  clientId: string;
  clientName?: string;
  companyName?: string;
  month?: number | null;
  year?: number | null;
  label?: string | null;
  /** Token em claro — presente apenas na resposta de criação. */
  token?: string;
  /** Ausente em sessões revogadas/expiradas ou legadas (sem token cifrado). */
  url?: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  documentsCount?: number;
}

export interface CreateClientUploadSessionDTO {
  clientId: string;
  month?: number | null;
  year?: number | null;
  label?: string | null;
  /** Validade do link em dias (por omissão 30, máx. 365). */
  expiresInDays?: number;
}

export interface PublicClientUploadSessionContextDTO {
  sessionId: string;
  clientName: string;
  companyName: string | null;
  month: number | null;
  year: number | null;
  label: string | null;
  expiresAt: string;
  recentUploads: Array<{
    id: string;
    title: string;
    type: string;
    status: DocumentStatus;
    createdAt: string;
    filesCount: number;
  }>;
}

export interface PublicUploadSubmissionDTO {
  title?: string;
  description?: string;
  type?: string;
}

// ============================================================
// Document Types (Templates & Slots dinâmicos)
// ============================================================

export interface DocumentTypeDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  required: boolean;
  isActive: boolean;
  sortOrder: number;
  allowedExtensions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentTypeDTO {
  code: string;
  name: string;
  description?: string | null;
  category?: string;
  required?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  allowedExtensions?: string | null;
}

export interface UpdateDocumentTypeDTO {
  code?: string;
  name?: string;
  description?: string | null;
  category?: string;
  required?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  allowedExtensions?: string | null;
}

export interface DocumentTypeFilterDTO {
  search?: string;
  category?: string;
  isActive?: boolean;
}
