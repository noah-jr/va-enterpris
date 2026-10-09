import { NewsletterSubscriber, PrismaClient } from '@prisma/client';
import { INewsletterRepository } from '../../core/repositories/INewsletterRepository';
import { prisma } from '../../infrastructure/database/prisma';

export class PrismaNewsletterRepository implements INewsletterRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async subscribe(email: string): Promise<NewsletterSubscriber> {
        return this.prisma.newsletterSubscriber.create({
            data: { email },
        });
    }

    async unsubscribe(email: string): Promise<void> {
        await this.prisma.newsletterSubscriber.delete({
            where: { email },
        });
    }

    async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
        return this.prisma.newsletterSubscriber.findUnique({
            where: { email },
        });
    }

    async findAll(): Promise<NewsletterSubscriber[]> {
        return this.prisma.newsletterSubscriber.findMany();
    }
}
