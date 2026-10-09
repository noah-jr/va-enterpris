import type { PrismaClient } from '@prisma/client';
import type {
  ClientUploadSessionEntity,
  ClientUploadSessionWithRelationsEntity,
  CreateClientUploadSessionData,
  IClientUploadSessionRepository,
} from '../../../domain/repositories/client-upload-session.repository.interface.js';

export class PrismaClientUploadSessionRepository implements IClientUploadSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateClientUploadSessionData): Promise<ClientUploadSessionEntity> {
    const session = await this.prisma.clientUploadSession.create({
      data: {
        clientId: data.clientId,
        createdByUserId: data.createdByUserId,
        label: data.label ?? null,
        month: data.month ?? null,
        year: data.year ?? null,
        tokenHash: data.tokenHash,
        tokenEncrypted: data.tokenEncrypted,
        expiresAt: data.expiresAt,
      },
    });
    return session;
  }

  async findById(id: string): Promise<ClientUploadSessionWithRelationsEntity | null> {
    const session = await this.prisma.clientUploadSession.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            nip: true,
            company: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            email: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { files: true },
            },
            files: {
              select: {
                id: true,
                originalName: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: { documents: true },
        },
      },
    });
    return session as ClientUploadSessionWithRelationsEntity | null;
  }

  async findByTokenHash(tokenHash: string): Promise<ClientUploadSessionWithRelationsEntity | null> {
    const session = await this.prisma.clientUploadSession.findUnique({
      where: { tokenHash },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            nip: true,
            company: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            email: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { files: true },
            },
            files: {
              select: {
                id: true,
                originalName: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: { documents: true },
        },
      },
    });
    return session as ClientUploadSessionWithRelationsEntity | null;
  }

  async listByClientId(clientId: string): Promise<ClientUploadSessionWithRelationsEntity[]> {
    const sessions = await this.prisma.clientUploadSession.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            nip: true,
            company: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: { documents: true },
        },
      },
    });
    return sessions as ClientUploadSessionWithRelationsEntity[];
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.clientUploadSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
