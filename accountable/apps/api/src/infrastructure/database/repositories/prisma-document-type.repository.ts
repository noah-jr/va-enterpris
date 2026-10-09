import type { PrismaClient } from '@prisma/client';
import type {
  CreateDocumentTypeData,
  DocumentTypeEntity,
  DocumentTypeFilterData,
  IDocumentTypeRepository,
  UpdateDocumentTypeData,
} from '../../../domain/repositories/document-type.repository.interface.js';

function toEntity(docType: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  required: boolean;
  isActive: boolean;
  sortOrder: number;
  allowedExtensions: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): DocumentTypeEntity {
  return {
    ...docType,
  };
}

export class PrismaDocumentTypeRepository implements IDocumentTypeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllActive(): Promise<DocumentTypeEntity[]> {
    const records = await this.prisma.documentType.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return records.map(toEntity);
  }

  async findAll(filter?: DocumentTypeFilterData): Promise<DocumentTypeEntity[]> {
    const where: {
      deletedAt: null;
      category?: string;
      isActive?: boolean;
      OR?: Array<{
        name?: { contains: string };
        code?: { contains: string };
        description?: { contains: string };
      }>;
    } = {
      deletedAt: null,
    };

    if (filter?.category) {
      where.category = filter.category;
    }

    if (typeof filter?.isActive === 'boolean') {
      where.isActive = filter.isActive;
    }

    if (filter?.search) {
      const search = filter.search;
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const records = await this.prisma.documentType.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return records.map(toEntity);
  }

  async findById(id: string): Promise<DocumentTypeEntity | null> {
    const record = await this.prisma.documentType.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? toEntity(record) : null;
  }

  async findByCode(code: string): Promise<DocumentTypeEntity | null> {
    const record = await this.prisma.documentType.findFirst({
      where: { code, deletedAt: null },
    });
    return record ? toEntity(record) : null;
  }

  async create(data: CreateDocumentTypeData): Promise<DocumentTypeEntity> {
    const created = await this.prisma.documentType.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        category: data.category ?? 'Geral',
        required: data.required ?? true,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        allowedExtensions: data.allowedExtensions ?? null,
      },
    });
    return toEntity(created);
  }

  async update(id: string, data: UpdateDocumentTypeData): Promise<DocumentTypeEntity> {
    const updated = await this.prisma.documentType.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.required !== undefined && { required: data.required }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.allowedExtensions !== undefined && { allowedExtensions: data.allowedExtensions }),
      },
    });
    return toEntity(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.documentType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
