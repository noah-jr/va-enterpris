import { Service } from "../entities/Service";

export interface IServiceRepository {
    findAll(options?: { activeOnly?: boolean }): Promise<Service[]>;
    findById(id: string): Promise<Service | null>;
    findBySlug(slug: string): Promise<Service | null>;
    create(service: Omit<Service, 'id'>): Promise<Service>;
    update(id: string, service: Partial<Service>): Promise<Service>;
    delete(id: string): Promise<void>;
}
