import type {
  IDocumentRepository,
  IDocumentFileRepository,
  IDocumentStatusHistoryRepository,
  DocumentEntity,
  DocumentFileEntity,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/index.js';

export interface DocumentDetailsOutput {
  document: DocumentEntity & {
    client?: { id: string; name: string; email: string; nip: string };
    assignments?: Array<{ userId: string }>;
  };
  files: Array<
    DocumentFileEntity & {
      downloadUrl: string;
    }
  >;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    changedById: string | null;
    note: string | null;
    createdAt: Date;
  }>;
}

export class GetDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly documentFileRepository: IDocumentFileRepository,
    private readonly statusHistoryRepository: IDocumentStatusHistoryRepository,
    private readonly fileStorage: IFileStorage,
    private readonly bucketName: string,
  ) {}

  async execute(
    documentId: string,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
    },
  ): Promise<DocumentDetailsOutput> {
    const document = await this.documentRepository.findByIdWithRelations(documentId);
    if (!document) {
      throw new NotFoundError('Documento', documentId);
    }

    if (context.actorType === 'client' && document.clientId !== context.actorId) {
      throw new ForbiddenError('Acesso não autorizado a este documento.');
    }

    const [files, statusHistory] = await Promise.all([
      this.documentFileRepository.findByDocumentId(documentId),
      this.statusHistoryRepository.findByDocumentId(documentId),
    ]);

    // Gerar URLs assinadas temporárias para cada ficheiro (expira em 15 minutos)
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const objectName = `documents/${document.id}/${file.storageName}`;
        const downloadUrl = await this.fileStorage.getSignedUrl({
          bucketName: this.bucketName,
          objectName,
          expiresIn: 15 * 60, // 15 minutos
        });

        return {
          ...file,
          downloadUrl,
        };
      }),
    );

    return {
      document,
      files: filesWithUrls,
      statusHistory,
    };
  }
}
