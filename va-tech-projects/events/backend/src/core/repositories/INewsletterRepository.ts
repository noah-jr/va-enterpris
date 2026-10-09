import { NewsletterSubscriber } from '@prisma/client';

export interface INewsletterRepository {
    subscribe(email: string): Promise<NewsletterSubscriber>;
    unsubscribe(email: string): Promise<void>;
    findByEmail(email: string): Promise<NewsletterSubscriber | null>;
    findAll(): Promise<NewsletterSubscriber[]>;
}
