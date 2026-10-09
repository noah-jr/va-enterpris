import { BaseService } from './BaseService';
import { Client } from '@prisma/client';

export class ClientService extends BaseService<Client> {
    async getAll(companyId: string): Promise<Client[]> {
        return this.prisma.client.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    async getById(id: string, companyId: string): Promise<Client | null> {
        return this.prisma.client.findFirst({
            where: { id, companyId },
        });
    }

    async create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
        return this.prisma.client.create({
            data,
        });
    }

    async update(id: string, companyId: string, data: Partial<Client>): Promise<Client | null> {
        const existing = await this.getById(id, companyId);
        if (!existing) return null;

        return this.prisma.client.update({
            where: { id },
            data,
        });
    }

    async delete(id: string, companyId: string): Promise<boolean> {
        const existing = await this.getById(id, companyId);
        if (!existing) return false;

        await this.prisma.client.delete({ where: { id } });
        return true;
    }
}
