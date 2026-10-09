import { Event, PrismaClient, TicketType } from '@prisma/client';
import { IEventRepository, CreateEventDTO } from '../../core/repositories/IEventRepository';
import { prisma } from '../../infrastructure/database/prisma';

export class PrismaEventRepository implements IEventRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async findById(id: string): Promise<(Event & { tickets: TicketType[] }) | null> {
        return this.prisma.event.findUnique({
            where: { id },
            include: { tickets: true },
        });
    }

    async findAll(status?: any): Promise<Event[]> {
        return this.prisma.event.findMany({
            where: status ? { status } : {},
            orderBy: { data: 'asc' },
        });
    }

    async create(data: CreateEventDTO): Promise<Event> {
        const { tickets, ...eventData } = data;
        return this.prisma.event.create({
            data: {
                ...eventData,
                tickets: {
                    create: tickets,
                },
            },
        });
    }

    async update(id: string, data: Partial<Event>): Promise<Event> {
        return this.prisma.event.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.event.delete({ where: { id } });
    }
}
