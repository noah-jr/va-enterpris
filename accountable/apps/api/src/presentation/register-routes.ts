import type { FastifyInstance } from 'fastify';
import type { ITokenService } from '../application/contracts/auth.contract.js';
import type { Controllers } from '../composition/controllers.js';
import type { LocalFileStorage } from '../infrastructure/storage/local.file-storage.js';
import { fileRoutes } from './routes/file.routes.js';

import { authRoutes } from './routes/auth.routes.js';
import { documentRoutes } from './routes/document.routes.js';
import { messageRoutes } from './routes/message.routes.js';
import { ticketRoutes } from './routes/ticket.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { clientRoutes } from './routes/client.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { roleRoutes } from './routes/user.routes.js';
import { auditRoutes } from './routes/audit.routes.js';
import { backupRoutes } from './routes/backup.routes.js';
import { publicPlanRoutes, adminPlanRoutes } from './routes/plan.routes.js';
import { publicContactRoutes, adminContactRoutes } from './routes/contact.routes.js';
import {
  publicDocumentTypeRoutes,
  adminDocumentTypeRoutes,
} from './routes/document-type.routes.js';
import {
  documentUploadLinkAdminRoutes,
  documentUploadLinkPublicRoutes,
} from './routes/document-upload-link.routes.js';
import { adminSettingsRoutes, clientSubscriptionRoutes } from './routes/admin-settings.routes.js';
import {
  clientUploadSessionAdminRoutes,
  clientUploadSessionPublicRoutes,
} from './routes/client-upload-session.routes.js';

export async function registerRoutes(
  app: FastifyInstance,
  controllers: Controllers,
  tokenService: ITokenService,
  localStorage: LocalFileStorage | null = null,
): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  app.get('/api/v1/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  await app.register(
    async (apiV1) => {
      if (localStorage) {
        await apiV1.register(fileRoutes, { prefix: '/files', storage: localStorage });
      }

      await apiV1.register(authRoutes, {
        prefix: '/auth',
        authController: controllers.authController,
        tokenService,
      });

      await apiV1.register(documentRoutes, {
        prefix: '/documents',
        documentController: controllers.documentController,
        tokenService,
      });

      await apiV1.register(messageRoutes, {
        prefix: '/documents',
        messageController: controllers.messageController,
        tokenService,
      });

      await apiV1.register(ticketRoutes, {
        prefix: '/tickets',
        ticketController: controllers.ticketController,
        tokenService,
      });

      await apiV1.register(notificationRoutes, {
        prefix: '/notifications',
        notificationController: controllers.notificationController,
        tokenService,
      });

      await apiV1.register(clientRoutes, {
        prefix: '/clients',
        clientController: controllers.clientController,
        tokenService,
      });

      await apiV1.register(userRoutes, {
        prefix: '/users',
        userController: controllers.userController,
        tokenService,
      });

      await apiV1.register(roleRoutes, {
        prefix: '/roles',
        userController: controllers.userController,
        tokenService,
      });

      await apiV1.register(auditRoutes, {
        prefix: '/audit',
        auditController: controllers.auditController,
        tokenService,
      });

      await apiV1.register(backupRoutes, {
        prefix: '/backups',
        backupController: controllers.backupController,
        tokenService,
      });

      await apiV1.register(publicPlanRoutes, {
        prefix: '/plans',
        planController: controllers.planController,
        tokenService,
      });

      await apiV1.register(adminPlanRoutes, {
        prefix: '/admin/plans',
        planController: controllers.planController,
        tokenService,
      });

      await apiV1.register(publicDocumentTypeRoutes, {
        prefix: '/document-types',
        documentTypeController: controllers.documentTypeController,
        tokenService,
      });

      await apiV1.register(adminDocumentTypeRoutes, {
        prefix: '/admin/document-types',
        documentTypeController: controllers.documentTypeController,
        tokenService,
      });

      await apiV1.register(publicContactRoutes, {
        contactController: controllers.contactController,
        tokenService,
      });

      await apiV1.register(adminContactRoutes, {
        prefix: '/admin/contact-requests',
        contactController: controllers.contactController,
        tokenService,
      });

      await apiV1.register(documentUploadLinkAdminRoutes, {
        prefix: '/documents',
        documentUploadLinkController: controllers.documentUploadLinkController,
        tokenService,
      });

      await apiV1.register(documentUploadLinkPublicRoutes, {
        prefix: '/public/upload-links',
        documentUploadLinkController: controllers.documentUploadLinkController,
        tokenService,
      });

      await apiV1.register(clientUploadSessionAdminRoutes, {
        prefix: '/clients',
        clientUploadSessionController: controllers.clientUploadSessionController,
        tokenService,
      });

      const settingsOptions = {
        tokenService,
        emailSettingsController: controllers.emailSettingsController,
        subscriptionController: controllers.subscriptionController,
        statsController: controllers.statsController,
      };
      await apiV1.register(adminSettingsRoutes, { prefix: '/admin', ...settingsOptions });
      await apiV1.register(clientSubscriptionRoutes, { prefix: '/subscriptions', ...settingsOptions });

      await apiV1.register(clientUploadSessionPublicRoutes, {
        prefix: '/public/upload-sessions',
        clientUploadSessionController: controllers.clientUploadSessionController,
        tokenService,
      });
    },
    { prefix: '/api/v1' },
  );
}
