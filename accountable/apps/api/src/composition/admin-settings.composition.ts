import {
  GetEmailSettingsUseCase,
  SendTestEmailUseCase,
  UpdateEmailSettingsUseCase,
} from '../application/use-cases/settings/index.js';
import {
  CreateSubscriptionUseCase,
  GetClientSubscriptionUseCase,
  ListSubscriptionsUseCase,
  RenewSubscriptionUseCase,
  UpdateSubscriptionUseCase,
} from '../application/use-cases/subscriptions/index.js';
import { GetStatsOverviewUseCase } from '../application/use-cases/stats/index.js';
import {
  EmailSettingsController,
  StatsController,
  SubscriptionController,
} from '../presentation/controllers/admin-settings.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildEmailSettingsController(infra: Infrastructure): EmailSettingsController {
  const { repositories, secretCipher, unitOfWork, emailService, smtpFallback } = infra;
  return new EmailSettingsController({
    getEmailSettingsUseCase: new GetEmailSettingsUseCase(repositories.emailSettingsRepository, {
      host: smtpFallback.host,
      port: smtpFallback.port,
      secure: smtpFallback.secure,
      username: smtpFallback.user || null,
      hasPassword: Boolean(smtpFallback.pass),
      fromName: smtpFallback.fromName,
      fromEmail: smtpFallback.fromEmail,
    }),
    updateEmailSettingsUseCase: new UpdateEmailSettingsUseCase(
      repositories.emailSettingsRepository,
      secretCipher,
      repositories.auditRepository,
      unitOfWork,
    ),
    sendTestEmailUseCase: new SendTestEmailUseCase(emailService, repositories.auditRepository),
  });
}

export function buildSubscriptionController(infra: Infrastructure): SubscriptionController {
  const { repositories, unitOfWork } = infra;
  const { subscriptionRepository, clientRepository, planRepository, auditRepository } = repositories;
  return new SubscriptionController({
    listSubscriptionsUseCase: new ListSubscriptionsUseCase(subscriptionRepository),
    createSubscriptionUseCase: new CreateSubscriptionUseCase(
      subscriptionRepository,
      clientRepository,
      planRepository,
      auditRepository,
      unitOfWork,
    ),
    updateSubscriptionUseCase: new UpdateSubscriptionUseCase(subscriptionRepository, planRepository, auditRepository, unitOfWork),
    renewSubscriptionUseCase: new RenewSubscriptionUseCase(subscriptionRepository, auditRepository, unitOfWork),
    getClientSubscriptionUseCase: new GetClientSubscriptionUseCase(subscriptionRepository),
  });
}

export function buildStatsController(infra: Infrastructure): StatsController {
  return new StatsController({ getStatsOverviewUseCase: new GetStatsOverviewUseCase(infra.repositories.statsRepository) });
}
