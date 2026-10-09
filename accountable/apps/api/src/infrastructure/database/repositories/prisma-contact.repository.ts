import type { PrismaClient } from '@prisma/client';
import type {
  ContactRequestEntity,
  ContactRequestStatus,
  CreateContactRequestData,
  IContactRequestRepository,
  INewsletterRepository,
  NewsletterSubscriberEntity,
} from '../../../domain/repositories/contact.repository.interface.js';

export class PrismaContactRequestRepository implements IContactRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateContactRequestData): Promise<ContactRequestEntity> {
    const request = await this.prisma.contactRequest.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company ?? null,
        phone: data.phone ?? null,
        message: data.message,
      },
    });
    return request;
  }

  async list(params: { page: number; perPage: number }): Promise<{ items: ContactRequestEntity[]; total: number }> {
    const { page, perPage } = params;
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      this.prisma.contactRequest.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactRequest.count(),
    ]);

    return { items, total };
  }

  async updateStatus(id: string, status: ContactRequestStatus): Promise<ContactRequestEntity> {
    return this.prisma.contactRequest.update({
      where: { id },
      data: { status },
    });
  }
}

export class PrismaNewsletterRepository implements INewsletterRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<NewsletterSubscriberEntity | null> {
    return this.prisma.newsletterSubscriber.findUnique({ where: { email } });
  }

  async create(email: string): Promise<NewsletterSubscriberEntity> {
    return this.prisma.newsletterSubscriber.create({ data: { email } });
  }

  async resubscribe(id: string): Promise<NewsletterSubscriberEntity> {
    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { unsubscribedAt: null },
    });
  }
}
