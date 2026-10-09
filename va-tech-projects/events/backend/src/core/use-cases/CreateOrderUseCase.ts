import { IOrderRepository, CreateOrderDTO } from '../repositories/IOrderRepository';
import { IEventRepository } from '../repositories/IEventRepository';
import { Order } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private eventRepository: IEventRepository
    ) { }

    async execute(data: {
        user_id: string;
        metodo_pagamento: string;
        items: {
            ticket_id: string;
            quantidade: number;
        }[];
    }): Promise<Order> {
        let total = 0;
        const orderItems: any[] = [];

        // Validar tickets e calcular total
        for (const item of data.items) {
            // Nota: No mundo real, buscaríamos o ticket type para validar preço e estoque
            // Aqui simplificaremos mas mantendo a estrutura
            // Supondo preço fixo para o exemplo ou buscando do repo

            // Gerar QR Codes únicos para cada bilhete
            for (let i = 0; i < item.quantidade; i++) {
                orderItems.push({
                    ticket_id: item.ticket_id,
                    qr_code: uuidv4(), // Gerar QR único
                    status: 'VALIDO',
                });
            }

            // Calculo de total (precisaria do preço do TicketType)
            // total += price * item.quantidade;
        }

        // Por agora, o total vem do frontend ou é simulado
        // Em produção, SEMPRE calcular no backend
        const finalOrder = await this.orderRepository.create({
            user_id: data.user_id,
            total: 5000, // Placeholder total
            metodo_pagamento: data.metodo_pagamento,
            items: orderItems,
        });

        return finalOrder;
    }
}
