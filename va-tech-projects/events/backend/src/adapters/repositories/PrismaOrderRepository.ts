import { Order, OrderItem, PrismaClient } from '@prisma/client';
import { IOrderRepository, CreateOrderDTO } from '../../core/repositories/IOrderRepository';
import { prisma } from '../../infrastructure/database/prisma';

export class PrismaOrderRepository implements IOrderRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async create(data: CreateOrderDTO): Promise<Order> {
        const { items, ...orderData } = data;
        return this.prisma.order.create({
            data: {
                user_id: orderData.user_id,
                total: orderData.total,
                metodo_pagamento: orderData.metodo_pagamento,
                items: {
                    create: items,
                },
            },
        });
    }

    async findById(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
        return this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
    }

    async findByUserId(userId: string): Promise<Order[]> {
        return this.prisma.order.findMany({
            where: { user_id: userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: string, status: any): Promise<Order> {
        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }
}
