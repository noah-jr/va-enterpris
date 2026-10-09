import type { Infrastructure } from './infrastructure.js';
import { buildAuthController } from './auth.composition.js';
import { buildDocumentController } from './documents.composition.js';
import { buildMessageController } from './messages.composition.js';
import { buildTicketController } from './tickets.composition.js';
import { buildNotificationController } from './notifications.composition.js';
import { buildClientController } from './clients.composition.js';
import { buildUserController } from './users.composition.js';
import { buildAuditController } from './audit.composition.js';
import { buildBackupController } from './backups.composition.js';
import { buildPlanController } from './plans.composition.js';
import { buildContactController } from './contact.composition.js';
import { buildDocumentUploadLinkController } from './document-upload-links.composition.js';
import { buildClientUploadSessionController } from './client-upload-sessions.composition.js';
import { buildDocumentTypeController } from './document-types.composition.js';
import {
  buildEmailSettingsController,
  buildStatsController,
  buildSubscriptionController,
} from './admin-settings.composition.js';

export function buildControllers(infra: Infrastructure) {
  return {
    authController: buildAuthController(infra),
    documentController: buildDocumentController(infra),
    messageController: buildMessageController(infra),
    ticketController: buildTicketController(infra),
    notificationController: buildNotificationController(infra),
    clientController: buildClientController(infra),
    userController: buildUserController(infra),
    auditController: buildAuditController(infra),
    backupController: buildBackupController(infra),
    planController: buildPlanController(infra),
    contactController: buildContactController(infra),
    documentUploadLinkController: buildDocumentUploadLinkController(infra),
    clientUploadSessionController: buildClientUploadSessionController(infra),
    documentTypeController: buildDocumentTypeController(infra),
    emailSettingsController: buildEmailSettingsController(infra),
    subscriptionController: buildSubscriptionController(infra),
    statsController: buildStatsController(infra),
  };
}

export type Controllers = ReturnType<typeof buildControllers>;

