import type { INewsletterRepository } from '../../../domain/repositories/contact.repository.interface.js';
import type { NewsletterSubscriberDTO } from '@accountable/types';
import type { SubscribeNewsletterInput } from '@accountable/schemas';
import { toNewsletterSubscriberDTO } from './contact.mapper.js';

export class SubscribeNewsletterUseCase {
  constructor(private readonly newsletterRepository: INewsletterRepository) {}

  async execute(input: SubscribeNewsletterInput): Promise<NewsletterSubscriberDTO> {
    const existing = await this.newsletterRepository.findByEmail(input.email);

    if (!existing) {
      const created = await this.newsletterRepository.create(input.email);
      return toNewsletterSubscriberDTO(created);
    }

    if (existing.unsubscribedAt) {
      const resubscribed = await this.newsletterRepository.resubscribe(existing.id);
      return toNewsletterSubscriberDTO(resubscribed);
    }

    return toNewsletterSubscriberDTO(existing);
  }
}
