import { Client } from '@prisma/client';
import prisma from '../lib/prisma';


export class ClientModel {
    static async getAllClients(companyId: string): Promise<Client[]> {
        return prisma.client.findMany({
            where: { companyId },
        });
    }

    static async getClientById(id: string, companyId: string): Promise<Client | null> {
        return prisma.client.findFirst({
            where: { id, companyId },
        });
    }

    static async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
        return prisma.client.create({
            data,
        });
    }

    static async updateClient(id: string, companyId: string, data: Partial<Client>): Promise<Client | null> {
        // Check if exists first to ensure company boundary
        const existing = await prisma.client.findFirst({ where: { id, companyId } });
        if (!existing) return null;

        return prisma.client.update({
            where: { id },
            data,
        });
    }

    static async deleteClient(id: string, companyId: string): Promise<boolean> {
        const existing = await prisma.client.findFirst({ where: { id, companyId } });
        if (!existing) return false;

        await prisma.client.delete({ where: { id } });
        return true;
    }
}
