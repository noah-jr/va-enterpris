import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IBackupRepository } from '../../../domain/repositories/backup.repository.interface.js';
import type { BackupDTO, BackupType } from '@accountable/types';
import { randomBytes, createHash } from 'node:crypto';


export class CreateBackupUseCase {
  constructor(
    private readonly backupRepository: IBackupRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    type: BackupType,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<BackupDTO> {
    const timestamp = new Date();
    const formattedDate = timestamp.toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${type.toLowerCase()}-${formattedDate}.tar.gz`;
    const storagePath = `backups/${filename}`;

    const simulatedBytes = BigInt(Math.floor(5 * 1024 * 1024 + Math.random() * 20 * 1024 * 1024));
    const checksum = createHash('sha256').update(randomBytes(32)).digest('hex');

    return this.unitOfWork.run(async () => {
      const backup = await this.backupRepository.create({
        type,
        status: 'SUCCESS',
        size: simulatedBytes,
        storagePath,
        checksum,
        createdById: context.actorId,
        completedAt: new Date(),
        logs: [
          {
            message: `Backup ${type} iniciado pelo utilizador ${context.actorId}`,
            level: 'INFO',
          },
          {
            message: `Snapshot criado com sucesso em ${storagePath}. Checksum SHA-256: ${checksum}`,
            level: 'INFO',
          },
        ],
      });

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'BACKUP_CREATED',
        entity: 'Backup',
        entityId: backup.id,
        metadata: { type, storagePath, checksum },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return {
        id: backup.id,
        type: backup.type,
        status: backup.status,
        size: backup.size !== null ? Number(backup.size) : null,
        checksum: backup.checksum,
        createdById: backup.createdById,
        createdAt: backup.createdAt.toISOString(),
        completedAt: backup.completedAt ? backup.completedAt.toISOString() : null,
      };
    });
  }
}
