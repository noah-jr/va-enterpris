import type { PrismaClient } from '@prisma/client';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { BcryptHasher } from '../infrastructure/auth/bcrypt.hasher.js';
import { JwtTokenService } from '../infrastructure/auth/jwt.token-service.js';
import { MinioFileStorage } from '../infrastructure/storage/minio.file-storage.js';
import { LocalFileStorage } from '../infrastructure/storage/local.file-storage.js';
import type { IFileStorage } from '../application/contracts/index.js';
import type { IOcrService } from '../application/contracts/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodemailerEmailService } from '../infrastructure/email/nodemailer.email-service.js';
import { OcrService } from '../infrastructure/ocr/ocr.service.js';
import { AesGcmSecretCipher } from '../infrastructure/crypto/aes-gcm.secret-cipher.js';
import {
  PrismaUnitOfWork,
  createTransactionAwarePrisma,
} from '../infrastructure/database/prisma-unit-of-work.js';
import { AuthSessionService } from '../application/services/auth-session.service.js';
import { EmailTokenService } from '../application/services/email-token.service.js';
import { HmacOtpService } from '../infrastructure/auth/hmac-otp.service.js';
import { createSmtpConfigResolver } from '../infrastructure/email/email-config.resolver.js';
import type { SmtpConfig } from '../infrastructure/email/nodemailer.email-service.js';

import {
  PrismaClientRepository,
  PrismaDocumentRepository,
  PrismaDocumentStatusHistoryRepository,
  PrismaDocumentFileRepository,
  PrismaUserRepository,
  PrismaAuditRepository,
  PrismaTokenRepository,
  PrismaMessageRepository,
  PrismaTicketRepository,
  PrismaTicketMessageRepository,
  PrismaNotificationRepository,
  PrismaPlanRepository,
  PrismaContactRequestRepository,
  PrismaNewsletterRepository,
  PrismaDocumentUploadLinkRepository,
  PrismaClientUploadSessionRepository,
  PrismaBackupRepository,
  PrismaDocumentTypeRepository,
  PrismaRefreshSessionRepository,
  PrismaRoleRepository,
  PrismaEmailSettingsRepository,
  PrismaSubscriptionRepository,
  PrismaStatsRepository,
} from '../infrastructure/database/repositories/index.js';

export interface Infrastructure {
  prisma: PrismaClient;
  hasher: BcryptHasher;
  tokenService: JwtTokenService;
  fileStorage: IFileStorage;
  /** Presente quando STORAGE_DRIVER=local — usado pela rota de download. */
  localStorage: LocalFileStorage | null;
  emailService: NodemailerEmailService;
  ocrService: IOcrService;
  unitOfWork: PrismaUnitOfWork;
  secretCipher: AesGcmSecretCipher;
  sessionService: AuthSessionService;
  emailTokens: EmailTokenService;
  otpService: HmacOtpService;
  smtpFallback: SmtpConfig;
  config: { appUrl: string; adminUrl: string; documentsBucket: string };
  repositories: {
    clientRepository: PrismaClientRepository;
    documentRepository: PrismaDocumentRepository;
    documentStatusHistoryRepository: PrismaDocumentStatusHistoryRepository;
    documentFileRepository: PrismaDocumentFileRepository;
    userRepository: PrismaUserRepository;
    auditRepository: PrismaAuditRepository;
    tokenRepository: PrismaTokenRepository;
    messageRepository: PrismaMessageRepository;
    ticketRepository: PrismaTicketRepository;
    ticketMessageRepository: PrismaTicketMessageRepository;
    notificationRepository: PrismaNotificationRepository;
    planRepository: PrismaPlanRepository;
    contactRequestRepository: PrismaContactRequestRepository;
    newsletterRepository: PrismaNewsletterRepository;
    documentUploadLinkRepository: PrismaDocumentUploadLinkRepository;
    clientUploadSessionRepository: PrismaClientUploadSessionRepository;
    backupRepository: PrismaBackupRepository;
    documentTypeRepository: PrismaDocumentTypeRepository;
    refreshSessionRepository: PrismaRefreshSessionRepository;
    roleRepository: PrismaRoleRepository;
    emailSettingsRepository: PrismaEmailSettingsRepository;
    subscriptionRepository: PrismaSubscriptionRepository;
    statsRepository: PrismaStatsRepository;
  };
}

export function buildInfrastructure(): Infrastructure {
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const hasher = new BcryptHasher(bcryptRounds);

  const tokenService = new JwtTokenService({
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-min-32-chars',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-min-32-chars',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  // Armazenamento dos documentos: disco local (por omissão) ou MinIO/S3.
  const storageDriver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
  const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const localStorage =
    storageDriver === 'minio'
      ? null
      : new LocalFileStorage({
          rootDir: process.env.LOCAL_STORAGE_PATH
            ? path.resolve(apiRoot, process.env.LOCAL_STORAGE_PATH)
            : path.join(apiRoot, 'storage'),
          signingSecret: process.env.STORAGE_SIGNING_SECRET || 'development-storage-signing-secret-32ch',
        });
  const fileStorage: IFileStorage =
    localStorage ??
    new MinioFileStorage({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });

  const smtpFallback: SmtpConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'VA OneGest',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'no-reply@vaonegest.local',
  };

  const ocrService = new OcrService();

  const config = {
    appUrl: process.env.APP_URL || 'http://localhost:5173',
    adminUrl: (process.env.ADMIN_URL || 'http://localhost:5174').replace(/\/+$/, ''),
    documentsBucket: process.env.MINIO_BUCKET_DOCUMENTS || 'accountable-documents',
  };

  const unitOfWork = new PrismaUnitOfWork(prisma);
  // Os repositórios usam este cliente para participarem automaticamente em transações.
  const db = createTransactionAwarePrisma(prisma);

  const secretCipher = new AesGcmSecretCipher(
    process.env.UPLOAD_TOKEN_ENCRYPTION_KEY || 'development-upload-token-key-min-32-chars',
  );

  const repositories = {
    clientRepository: new PrismaClientRepository(db),
    documentRepository: new PrismaDocumentRepository(db),
    documentStatusHistoryRepository: new PrismaDocumentStatusHistoryRepository(db),
    documentFileRepository: new PrismaDocumentFileRepository(db),
    userRepository: new PrismaUserRepository(db),
    auditRepository: new PrismaAuditRepository(db),
    tokenRepository: new PrismaTokenRepository(db),
    messageRepository: new PrismaMessageRepository(db),
    ticketRepository: new PrismaTicketRepository(db),
    ticketMessageRepository: new PrismaTicketMessageRepository(db),
    notificationRepository: new PrismaNotificationRepository(db),
    planRepository: new PrismaPlanRepository(db),
    contactRequestRepository: new PrismaContactRequestRepository(db),
    newsletterRepository: new PrismaNewsletterRepository(db),
    documentUploadLinkRepository: new PrismaDocumentUploadLinkRepository(db),
    clientUploadSessionRepository: new PrismaClientUploadSessionRepository(db),
    backupRepository: new PrismaBackupRepository(db),
    documentTypeRepository: new PrismaDocumentTypeRepository(db),
    refreshSessionRepository: new PrismaRefreshSessionRepository(db),
    roleRepository: new PrismaRoleRepository(db),
    emailSettingsRepository: new PrismaEmailSettingsRepository(db),
    subscriptionRepository: new PrismaSubscriptionRepository(db),
    statsRepository: new PrismaStatsRepository(db),
  };

  // Configuração SMTP: painel de administração (se ativa) ou variáveis SMTP_*.
  const emailService = new NodemailerEmailService(
    createSmtpConfigResolver(repositories.emailSettingsRepository, secretCipher, smtpFallback),
  );

  const otpService = new HmacOtpService(process.env.OTP_SECRET || 'development-otp-secret-min-32-chars-long');
  const emailTokens = new EmailTokenService(repositories.tokenRepository, tokenService, otpService);

  const sessionService = new AuthSessionService(
    tokenService,
    repositories.refreshSessionRepository,
    repositories.clientRepository,
    repositories.userRepository,
    unitOfWork,
  );

  return {
    prisma,
    hasher,
    tokenService,
    fileStorage,
    localStorage,
    emailService,
    ocrService,
    unitOfWork,
    secretCipher,
    sessionService,
    emailTokens,
    otpService,
    smtpFallback,
    config,
    repositories,
  };
}

