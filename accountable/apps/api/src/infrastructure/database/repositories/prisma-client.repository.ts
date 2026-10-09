import type { PrismaClient } from '@prisma/client';
import type {
  ClientEntity,
  CreateClientData,
  IClientRepository,
} from '../../../domain/repositories/client.repository.interface.js';

export class PrismaClientRepository implements IClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    });
    return client;
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findFirst({
      where: { email, deletedAt: null },
    });
    return client;
  }

  async findByNip(nip: string): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findFirst({
      where: { nip, deletedAt: null },
    });
    return client;
  }

  async create(data: CreateClientData): Promise<ClientEntity> {
    const client = await this.prisma.client.create({
      data: {
        nip: data.nip,
        name: data.name,
        email: data.email,
        isActive: false,
        emailVerified: false,
      },
    });
    return client;
  }

  async setInitialPassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await this.prisma.client.updateMany({
      where: { id, passwordHash: null, deletedAt: null },
      data: { passwordHash },
    });
    return result.count === 1;
  }

  async update(
    id: string,
    data: Partial<Omit<ClientEntity, 'id' | 'createdAt'>>,
  ): Promise<ClientEntity> {
    const client = await this.prisma.client.update({
      where: { id },
      data,
    });
    return client;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async list(params: {
    page: number;
    perPage: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ items: ClientEntity[]; total: number }> {
    const { page, perPage, search, isActive } = params;
    const skip = (page - 1) * perPage;

    const where = {
      deletedAt: null,
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { nip: { contains: search } },
              { company: { contains: search } },
            ],
          }
        : {}),
    };

    const [rawClients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: perPage,
        include: {
          _count: {
            select: {
              documents: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    const items = rawClients.map((client) => ({
      id: client.id,
      nip: client.nip,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      department: client.department,
      isActive: client.isActive,
      emailVerified: client.emailVerified,
      passwordHash: client.passwordHash,
      lastLoginAt: client.lastLoginAt,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      deletedAt: client.deletedAt,
      documentsCount: client._count.documents,
    }));

    return { items, total };
  }
}
