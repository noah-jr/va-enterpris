import type { PrismaClient } from '@prisma/client';
import type {
  EmailSettingsEntity,
  IEmailSettingsRepository,
  SaveEmailSettingsData,
} from '../../../domain/repositories/email-settings.repository.interface.js';

const SINGLETON_ID = 'default';

export class PrismaEmailSettingsRepository implements IEmailSettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(): Promise<EmailSettingsEntity | null> {
    const row = await this.prisma.emailSettings.findUnique({ where: { id: SINGLETON_ID } });
    return row ? { ...row, provider: row.provider === 'GMAIL' ? 'GMAIL' : 'SMTP' } : null;
  }

  async save(data: SaveEmailSettingsData): Promise<EmailSettingsEntity> {
    const row = await this.prisma.emailSettings.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, ...data },
      update: data,
    });
    return { ...row, provider: row.provider === 'GMAIL' ? 'GMAIL' : 'SMTP' };
  }
}
