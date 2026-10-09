import type { BackupType, BackupStatus } from '@accountable/types';

export interface BackupEntity {
  id: string;
  type: BackupType;
  status: BackupStatus;
  size: bigint | null;
  storagePath: string | null;
  checksum: string | null;
  createdById: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface CreateBackupData {
  type: BackupType;
  status: BackupStatus;
  size: bigint;
  storagePath: string;
  checksum: string;
  createdById: string;
  completedAt: Date;
  logs: Array<{ message: string; level: string }>;
}

export interface IBackupRepository {
  create(data: CreateBackupData): Promise<BackupEntity>;
  list(limit?: number): Promise<BackupEntity[]>;
}

