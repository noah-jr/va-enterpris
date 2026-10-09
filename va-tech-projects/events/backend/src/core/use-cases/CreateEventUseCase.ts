import { IEventRepository, CreateEventDTO } from '../repositories/IEventRepository';
import { Event } from '@prisma/client';

export class CreateEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(data: CreateEventDTO): Promise<Event> {
        if (!data.titulo || !data.data || !data.local) {
            throw new Error('Missing required fields for event creation');
        }

        const event = await this.eventRepository.create(data);
        return event;
    }
}
