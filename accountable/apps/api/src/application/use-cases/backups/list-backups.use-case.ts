import type { IBackupRepository } from '../../../domain/repositories/backup.repository.interface.js';
import type { BackupDTO } from '@accountable/types';

export class ListBackupsUseCase {
  constructor(private readonly backupRepository: IBackupRepository) {}

  async execute(): Promise<BackupDTO[]> {
    const backups = await this.backupRepository.list(50);

    return backups.map((b) => ({
      id: b.id,
      type: b.type,
      status: b.status,
      size: b.size !== null ? Number(b.size) : null,
      checksum: b.checksum,
      createdById: b.createdById,
      createdAt: b.createdAt.toISOString(),
      completedAt: b.completedAt ? b.completedAt.toISOString() : null,
    }));
  }
}
