import {
  SubmitContactRequestUseCase,
  SubscribeNewsletterUseCase,
  ListContactRequestsUseCase,
} from '../application/use-cases/contact/index.js';
import { ContactController } from '../presentation/controllers/contact.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildContactController(infra: Infrastructure): ContactController {
  const { contactRequestRepository, newsletterRepository, auditRepository } = infra.repositories;

  const submitContactRequestUseCase = new SubmitContactRequestUseCase(contactRequestRepository, auditRepository, infra.unitOfWork);
  const subscribeNewsletterUseCase = new SubscribeNewsletterUseCase(newsletterRepository);
  const listContactRequestsUseCase = new ListContactRequestsUseCase(contactRequestRepository);

  return new ContactController({
    submitContactRequestUseCase,
    subscribeNewsletterUseCase,
    listContactRequestsUseCase,
  });
}
