import { IServiceRepository } from "@/core/domain/repositories/IServiceRepository";
import { Service } from "@/core/domain/entities/Service";

export class GetServiceBySlug {
    constructor(private serviceRepository: IServiceRepository) { }

    async execute(slug: string): Promise<Service | null> {
        return this.serviceRepository.findBySlug(slug);
    }
}
