import { OrderItem, PrismaClient } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma';

export interface ICheckInRepository {
    findByQrCode(qrCode: string): Promise<OrderItem | null>;
    markAsUsed(id: string): Promise<void>;
}

export class PrismaCheckInRepository implements ICheckInRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async findByQrCode(qrCode: string): Promise<OrderItem | null> {
        return this.prisma.orderItem.findUnique({
            where: { qr_code: qrCode },
        });
    }

    async markAsUsed(id: string): Promise<void> {
        await this.prisma.orderItem.update({
            where: { id },
            data: { status: 'UTILIZADO' },
        });
    }
}
