// ============================================================
// File types
// ============================================================

export interface DocumentFileDTO {
  id: string;
  documentId: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploaderType: 'CLIENT' | 'USER';
  createdAt: string;
  // storagePath is NEVER exposed to clients
}

export interface MessageFileDTO {
  id: string;
  messageId: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface SignedDownloadUrlDTO {
  url: string;
  expiresAt: string;
}
