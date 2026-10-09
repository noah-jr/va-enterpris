import type { PrismaClient } from '@prisma/client';
import type {
  DocumentUploadLinkEntity,
  CreateDocumentUploadLinkData,
  IDocumentUploadLinkRepository,
} from '../../../domain/repositories/document-upload-link.repository.interface.js';

export class PrismaDocumentUploadLinkRepository implements IDocumentUploadLinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateDocumentUploadLinkData): Promise<DocumentUploadLinkEntity> {
    const link = await this.prisma.documentUploadLink.create({
      data: {
        documentId: data.documentId,
        tokenHash: data.tokenHash,
        createdByUserId: data.createdByUserId,
        expiresAt: data.expiresAt,
      },
    });
    return link;
  }

  async findByTokenHash(tokenHash: string): Promise<DocumentUploadLinkEntity | null> {
    const link = await this.prisma.documentUploadLink.findUnique({
      where: { tokenHash },
    });
    return link;
  }

  async findById(id: string): Promise<DocumentUploadLinkEntity | null> {
    const link = await this.prisma.documentUploadLink.findUnique({
      where: { id },
    });
    return link;
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.documentUploadLink.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
