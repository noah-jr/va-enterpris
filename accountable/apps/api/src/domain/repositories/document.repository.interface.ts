import type { DocumentStatus, DocumentPriority } from '@accountable/types';

// ============================================================
// Document entities used in domain
// ============================================================

export interface DocumentEntity {
  id: string;
  clientId: string;
  uploadSessionId?: string | null;
  title: string;
  description: string | null;
  type: string;
  priority: DocumentPriority;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateDocumentData {
  clientId: string;
  title: string;
  description?: string;
  type: string;
  priority: DocumentPriority;
  status?: DocumentStatus;
  uploadSessionId?: string | null;
}

export interface IDocumentRepository {
  findById(id: string): Promise<DocumentEntity | null>;
  findByIdWithRelations(id: string): Promise<(DocumentEntity & {
    client: { id: string; name: string; email: string; nip: string };
    assignments: Array<{ userId: string }>;
    _count: { files: number; messages: number };
  }) | null>;
  create(data: CreateDocumentData): Promise<DocumentEntity>;
  update(id: string, data: Partial<Omit<DocumentEntity, 'id' | 'clientId' | 'createdAt'>>): Promise<DocumentEntity>;
  softDelete(id: string): Promise<void>;
  list(params: {
    page: number;
    perPage: number;
    status?: DocumentStatus;
    priority?: DocumentPriority;
    clientId?: string;
    search?: string;
  }): Promise<{ items: DocumentEntity[]; total: number }>;
}

// ============================================================
// DocumentFile
// ============================================================

export interface DocumentFileEntity {
  id: string;
  documentId: string;
  originalName: string;
  storageName: string;
  mimeType: string;
  size: number;
  checksum: string;
  storagePath: string;
  uploadedById: string;
  uploaderType: 'CLIENT' | 'USER';
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateDocumentFileData {
  documentId: string;
  originalName: string;
  storageName: string;
  mimeType: string;
  size: number;
  checksum: string;
  storagePath: string;
  uploadedById: string;
  uploaderType: 'CLIENT' | 'USER';
}

export interface IDocumentFileRepository {
  findById(id: string): Promise<DocumentFileEntity | null>;
  findByDocumentId(documentId: string): Promise<DocumentFileEntity[]>;
  create(data: CreateDocumentFileData): Promise<DocumentFileEntity>;
  softDelete(id: string): Promise<void>;
}

// ============================================================
// DocumentStatusHistory
// ============================================================

export interface CreateStatusHistoryData {
  documentId: string;
  fromStatus: DocumentStatus | null;
  toStatus: DocumentStatus;
  changedById?: string;
  note?: string;
}

export interface IDocumentStatusHistoryRepository {
  create(data: CreateStatusHistoryData): Promise<void>;
  findByDocumentId(documentId: string): Promise<Array<{
    id: string;
    fromStatus: DocumentStatus | null;
    toStatus: DocumentStatus;
    changedById: string | null;
    note: string | null;
    createdAt: Date;
  }>>;
}
