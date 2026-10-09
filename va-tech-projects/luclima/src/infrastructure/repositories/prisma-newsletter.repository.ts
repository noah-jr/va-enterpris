import type {
    INewsletterRepository,
    NewsletterFilters,
} from '@/domain/repositories';
import type { Newsletter } from '@/domain/entities';
import { prisma } from '../database/prisma';

export class PrismaNewsletterRepository implements INewsletterRepository {
    async findByEmail(email: string): Promise<Newsletter | null> {
        const newsletter = await prisma.newsletter.findUnique({
            where: { email },
        });

        return newsletter as Newsletter | null;
    }

    async findAll(filters?: NewsletterFilters): Promise<Newsletter[]> {
        const where: any = {};

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        const newsletters = await prisma.newsletter.findMany({
            where,
            orderBy: {
                subscribedAt: 'desc',
            },
        });

        return newsletters as Newsletter[];
    }

    async create(email: string): Promise<Newsletter> {
        const newsletter = await prisma.newsletter.create({
            data: { email },
        });

        return newsletter as Newsletter;
    }

    async update(id: string, isActive: boolean): Promise<Newsletter> {
        const newsletter = await prisma.newsletter.update({
            where: { id },
            data: { isActive },
        });

        return newsletter as Newsletter;
    }

    async delete(id: string): Promise<void> {
        await prisma.newsletter.delete({
            where: { id },
        });
    }

    async count(): Promise<number> {
        return prisma.newsletter.count({
            where: { isActive: true },
        });
    }
}
