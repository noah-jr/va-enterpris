import { IServiceRepository } from "@/core/domain/repositories/IServiceRepository";
import { Service } from "@/core/domain/entities/Service";

export class ListServices {
    constructor(private serviceRepository: IServiceRepository) { }

    async execute(): Promise<Service[]> {
        return this.serviceRepository.findAll({ activeOnly: true });
    }
}
