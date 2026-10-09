export interface EmailSettingsEntity {
  provider: 'GMAIL' | 'SMTP';
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  passwordEncrypted: string | null;
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
  otpEnabled: boolean;
  verificationExpiresHours: number;
  passwordResetExpiresMinutes: number;
  updatedById: string | null;
  updatedAt: Date;
}

export type SaveEmailSettingsData = Omit<EmailSettingsEntity, 'updatedAt'>;

export interface IEmailSettingsRepository {
  get(): Promise<EmailSettingsEntity | null>;
  save(data: SaveEmailSettingsData): Promise<EmailSettingsEntity>;
}
