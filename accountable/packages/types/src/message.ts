// ============================================================
// Message types (thread de comunicação)
// ============================================================

export type SenderType = 'CLIENT' | 'USER' | 'SYSTEM';

export interface MessageDTO {
  id: string;
  documentId: string;
  senderId: string;
  senderType: SenderType;
  senderName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  files: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
  }>;
}

export interface SendMessageDTO {
  documentId: string;
  content: string;
  isInternal?: boolean;
}
