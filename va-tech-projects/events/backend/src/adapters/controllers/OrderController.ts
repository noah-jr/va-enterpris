import { Request, Response } from 'express';
import { CreateOrderUseCase } from '../../core/use-cases/CreateOrderUseCase';
import { PrismaOrderRepository } from '../repositories/PrismaOrderRepository';
import { PrismaEventRepository } from '../repositories/PrismaEventRepository';

const orderRepository = new PrismaOrderRepository();
const eventRepository = new PrismaEventRepository();
const createOrderUseCase = new CreateOrderUseCase(orderRepository, eventRepository);

export class OrderController {
    async create(req: any, res: Response) {
        try {
            const user_id = req.user.userId;
            const orderData = { ...req.body, user_id };

            const order = await createOrderUseCase.execute(orderData);
            res.status(201).json(order);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMyOrders(req: any, res: Response) {
        try {
            const user_id = req.user.userId;
            const orders = await orderRepository.findByUserId(user_id);
            res.status(200).json(orders);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getOrderDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const order = await orderRepository.findById(id as string);
            if (!order) {
                return res.status(404).json({ error: 'Encomenda não encontrada' });
            }
            res.status(200).json(order);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
