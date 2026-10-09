import type { PrismaClient } from '@prisma/client';
import type {
  IBackupRepository,
  BackupEntity,
  CreateBackupData,
} from '../../../domain/repositories/backup.repository.interface.js';

export class PrismaBackupRepository implements IBackupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateBackupData): Promise<BackupEntity> {
    const backup = await this.prisma.backup.create({
      data: {
        type: data.type,
        status: data.status,
        size: data.size,
        storagePath: data.storagePath,
        checksum: data.checksum,
        createdById: data.createdById,
        completedAt: data.completedAt,
        logs: {
          create: data.logs,
        },
      },
    });
    return backup;
  }

  async list(limit = 50): Promise<BackupEntity[]> {
    const backups = await this.prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return backups;
  }
}
