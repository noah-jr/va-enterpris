import type {
  IDocumentRepository,
  IDocumentFileRepository,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/index.js';
import type { IOcrService } from '../../contracts/ocr.contract.js';
import type { DocumentOcrResult } from '@accountable/types';

export class GetDocumentOcrUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly documentFileRepository: IDocumentFileRepository,
    private readonly fileStorage: IFileStorage,
    private readonly ocrService: IOcrService,
    private readonly bucketName: string,
  ) {}

  async execute(
    documentId: string,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
    },
  ): Promise<DocumentOcrResult> {
    const document = await this.documentRepository.findByIdWithRelations(documentId);
    if (!document) {
      throw new NotFoundError('Documento', documentId);
    }

    if (context.actorType === 'client' && document.clientId !== context.actorId) {
      throw new ForbiddenError('Acesso não autorizado a este documento.');
    }

    const files = await this.documentFileRepository.findByDocumentId(documentId);
    if (!files || files.length === 0) {
      throw new NotFoundError('Ficheiros do processo para análise OCR', documentId);
    }

    // Latest file attached
    const primaryFile = files[0];
    if (!primaryFile) {
      throw new NotFoundError('Ficheiro principal para análise OCR', documentId);
    }

    const objectName = `documents/${document.id}/${primaryFile.storageName}`;
    const buffer = await this.fileStorage.getObject(this.bucketName, objectName);

    const clientName = document.client?.name ?? 'Cliente';
    const clientNip = document.client?.nip ?? '';

    const text = await this.ocrService.extractText(
      buffer,
      primaryFile.mimeType,
      primaryFile.originalName,
    );

    return this.ocrService.analyzeDocument(
      {
        documentId: document.id,
        documentTitle: document.title,
        declaredType: document.type,
        clientNip,
        clientName,
        fileId: primaryFile.id,
        fileName: primaryFile.originalName,
        fileSize: primaryFile.size,
        mimeType: primaryFile.mimeType,
        buffer,
      },
      text,
    );
  }
}
