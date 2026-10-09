import { Event, TicketType } from '@prisma/client';

export type CreateEventDTO = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    tickets: Omit<TicketType, 'id' | 'event_id'>[];
};

export interface IEventRepository {
    findById(id: string): Promise<(Event & { tickets: TicketType[] }) | null>;
    findAll(status?: string): Promise<Event[]>;
    create(data: CreateEventDTO): Promise<Event>;
    update(id: string, data: Partial<Event>): Promise<Event>;
    delete(id: string): Promise<void>;
}
