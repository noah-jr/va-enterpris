import type { PrismaClient } from '@prisma/client';
import type {
  DocumentFileEntity,
  CreateDocumentFileData,
  IDocumentFileRepository,
} from '../../../domain/repositories/document.repository.interface.js';

export class PrismaDocumentFileRepository implements IDocumentFileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DocumentFileEntity | null> {
    const file = await this.prisma.documentFile.findFirst({
      where: { id, deletedAt: null },
    });
    return file;
  }

  async findByDocumentId(documentId: string): Promise<DocumentFileEntity[]> {
    const files = await this.prisma.documentFile.findMany({
      where: { documentId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return files;
  }

  async create(data: CreateDocumentFileData): Promise<DocumentFileEntity> {
    const file = await this.prisma.documentFile.create({
      data: {
        documentId: data.documentId,
        originalName: data.originalName,
        storageName: data.storageName,
        mimeType: data.mimeType,
        size: data.size,
        checksum: data.checksum,
        storagePath: data.storagePath,
        uploadedById: data.uploadedById,
        uploaderType: data.uploaderType,
      },
    });
    return file;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.documentFile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
