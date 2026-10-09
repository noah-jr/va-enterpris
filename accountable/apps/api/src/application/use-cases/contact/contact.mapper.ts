import type { ContactRequestEntity, NewsletterSubscriberEntity } from '../../../domain/repositories/contact.repository.interface.js';
import type { ContactRequestDTO, ContactRequestStatus, NewsletterSubscriberDTO } from '@accountable/types';

export function toContactRequestDTO(entity: ContactRequestEntity): ContactRequestDTO {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    company: entity.company,
    phone: entity.phone,
    message: entity.message,
    status: entity.status as ContactRequestStatus,
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toNewsletterSubscriberDTO(entity: NewsletterSubscriberEntity): NewsletterSubscriberDTO {
  return {
    id: entity.id,
    email: entity.email,
    createdAt: entity.createdAt.toISOString(),
    unsubscribedAt: entity.unsubscribedAt ? entity.unsubscribedAt.toISOString() : null,
  };
}
