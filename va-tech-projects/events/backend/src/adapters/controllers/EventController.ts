import { Request, Response } from 'express';
import { CreateEventUseCase } from '../../core/use-cases/CreateEventUseCase';
import { PrismaEventRepository } from '../repositories/PrismaEventRepository';

const eventRepository = new PrismaEventRepository();
const createEventUseCase = new CreateEventUseCase(eventRepository);

export class EventController {
    async create(req: Request, res: Response) {
        try {
            const event = await createEventUseCase.execute(req.body);
            res.status(201).json(event);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const { status } = req.query;
            const events = await eventRepository.findAll(status as any);
            res.status(200).json(events);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const event = await eventRepository.findById(id as string);
            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }
            res.status(200).json(event);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
