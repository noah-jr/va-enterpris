import { ListBackupsUseCase, CreateBackupUseCase } from '../application/use-cases/backups/index.js';
import { BackupController } from '../presentation/controllers/backup.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildBackupController(infra: Infrastructure): BackupController {
  const listBackupsUseCase = new ListBackupsUseCase(infra.repositories.backupRepository);
  const createBackupUseCase = new CreateBackupUseCase(
    infra.repositories.backupRepository,
    infra.repositories.auditRepository,
    infra.unitOfWork,
  );

  return new BackupController({ listBackupsUseCase, createBackupUseCase });
}
