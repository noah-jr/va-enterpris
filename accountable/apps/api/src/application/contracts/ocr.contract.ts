import type { DocumentOcrResult } from '@accountable/types';

export interface ProcessOcrInput {
  documentId: string;
  documentTitle: string;
  declaredType: string;
  clientNip: string;
  clientName: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  buffer: Buffer;
}

export interface IOcrService {
  extractText(buffer: Buffer, mimeType: string, fileName: string): Promise<string>;
  analyzeDocument(input: ProcessOcrInput, text: string): DocumentOcrResult;
}
