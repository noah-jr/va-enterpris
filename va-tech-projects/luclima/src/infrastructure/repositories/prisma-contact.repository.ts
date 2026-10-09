import type {
    IContactRepository,
    CreateContactDTO,
    UpdateContactDTO,
    ContactFilters,
} from '@/domain/repositories';
import type { Contact } from '@/domain/entities';
import { prisma } from '../database/prisma';

export class PrismaContactRepository implements IContactRepository {
    async findById(id: string): Promise<Contact | null> {
        const contact = await prisma.contact.findUnique({
            where: { id },
        });
        return contact as Contact | null;
    }

    async findAll(filters?: ContactFilters): Promise<Contact[]> {
        const where: { isReplied?: boolean } = {};
        if (filters?.isReplied !== undefined) {
            where.isReplied = filters.isReplied;
        }
        const contacts = await prisma.contact.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return contacts as Contact[];
    }

    async create(data: CreateContactDTO): Promise<Contact> {
        const contact = await prisma.contact.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                subject: data.subject,
                message: data.message,
            },
        });
        return contact as Contact;
    }

    async update(id: string, data: UpdateContactDTO): Promise<Contact> {
        const contact = await prisma.contact.update({
            where: { id },
            data: {
                ...(data.isReplied !== undefined && { isReplied: data.isReplied }),
                ...(data.repliedAt !== undefined && { repliedAt: data.repliedAt }),
            },
        });
        return contact as Contact;
    }

    async delete(id: string): Promise<void> {
        await prisma.contact.delete({ where: { id } });
    }
}
