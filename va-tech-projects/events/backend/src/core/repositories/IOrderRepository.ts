import { Order, OrderItem } from '@prisma/client';

export type CreateOrderDTO = {
    user_id: string;
    total: number;
    metodo_pagamento: string;
    items: {
        ticket_id: string;
        qr_code: string;
    }[];
};

export interface IOrderRepository {
    create(data: CreateOrderDTO): Promise<Order>;
    findById(id: string): Promise<(Order & { items: OrderItem[] }) | null>;
    findByUserId(userId: string): Promise<Order[]>;
    updateStatus(id: string, status: 'PAGO' | 'CANCELADO'): Promise<Order>;
}
