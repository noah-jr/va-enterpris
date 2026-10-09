import { prisma } from '@/infrastructure/database/prisma';
import type { INewsletterCampaignRepository, CreateNewsletterCampaignDTO } from '@/domain/repositories';
import type { NewsletterCampaign } from '@/domain/entities';

export class PrismaNewsletterCampaignRepository implements INewsletterCampaignRepository {
    async findById(id: string): Promise<NewsletterCampaign | null> {
        return prisma.newsletterCampaign.findUnique({
            where: { id },
        });
    }

    async findAll(): Promise<NewsletterCampaign[]> {
        return prisma.newsletterCampaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: CreateNewsletterCampaignDTO): Promise<NewsletterCampaign> {
        return prisma.newsletterCampaign.create({
            data: {
                subject: data.subject,
                content: data.content,
            },
        });
    }

    async update(id: string, sentAt: Date): Promise<NewsletterCampaign> {
        return prisma.newsletterCampaign.update({
            where: { id },
            data: { sentAt },
        });
    }
}
