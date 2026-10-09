export interface DocumentUploadLinkEntity {
  id: string;
  documentId: string;
  tokenHash: string;
  createdByUserId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface CreateDocumentUploadLinkData {
  documentId: string;
  tokenHash: string;
  createdByUserId: string;
  expiresAt: Date;
}

export interface IDocumentUploadLinkRepository {
  create(data: CreateDocumentUploadLinkData): Promise<DocumentUploadLinkEntity>;
  findByTokenHash(tokenHash: string): Promise<DocumentUploadLinkEntity | null>;
  findById(id: string): Promise<DocumentUploadLinkEntity | null>;
  revoke(id: string): Promise<void>;
}
