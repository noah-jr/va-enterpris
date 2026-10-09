import type { PrismaClient } from '@prisma/client';
import type { DocumentStatus, DocumentPriority } from '@accountable/types';
import type {
  DocumentEntity,
  CreateDocumentData,
  IDocumentRepository,
  CreateStatusHistoryData,
  IDocumentStatusHistoryRepository,
} from '../../../domain/repositories/document.repository.interface.js';

export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DocumentEntity | null> {
    const doc = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
    return doc;
  }

  async findByIdWithRelations(id: string): Promise<(DocumentEntity & {
    client: { id: string; name: string; email: string; nip: string };
    assignments: Array<{ userId: string }>;
    _count: { files: number; messages: number };
  }) | null> {
    const doc = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: {
          select: { id: true, name: true, email: true, nip: true },
        },
        assignments: {
          select: { userId: true },
        },
        _count: {
          select: {
            files: { where: { deletedAt: null } },
            messages: { where: { deletedAt: null } },
          },
        },
      },
    });

    return doc;
  }

  async create(data: CreateDocumentData): Promise<DocumentEntity> {
    const doc = await this.prisma.document.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        priority: data.priority,
        status: data.status ?? 'DRAFT',
        uploadSessionId: data.uploadSessionId ?? null,
      },
    });
    return doc;
  }

  async update(
    id: string,
    data: Partial<Omit<DocumentEntity, 'id' | 'clientId' | 'createdAt'>>,
  ): Promise<DocumentEntity> {
    const doc = await this.prisma.document.update({
      where: { id },
      data,
    });
    return doc;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async list(params: {
    page: number;
    perPage: number;
    status?: DocumentStatus;
    priority?: DocumentPriority;
    clientId?: string;
    search?: string;
  }): Promise<{ items: DocumentEntity[]; total: number }> {
    const { page, perPage, status, priority, clientId, search } = params;
    const skip = (page - 1) * perPage;

    const where = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(clientId ? { clientId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { type: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { items, total };
  }
}

export class PrismaDocumentStatusHistoryRepository implements IDocumentStatusHistoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateStatusHistoryData): Promise<void> {
    await this.prisma.documentStatusHistory.create({
      data: {
        documentId: data.documentId,
        fromStatus: data.fromStatus,
        toStatus: data.toStatus,
        changedById: data.changedById ?? null,
        note: data.note ?? null,
      },
    });
  }

  async findByDocumentId(documentId: string): Promise<Array<{
    id: string;
    fromStatus: DocumentStatus | null;
    toStatus: DocumentStatus;
    changedById: string | null;
    note: string | null;
    createdAt: Date;
  }>> {
    const history = await this.prisma.documentStatusHistory.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    });
    return history;
  }
}
