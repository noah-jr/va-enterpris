import type { IServiceRepository, CreateServiceDTO, UpdateServiceDTO, ServiceFilters } from '@/domain/repositories';
import type { Service } from '@/domain/entities';

export class ServiceUseCases {
    constructor(private serviceRepository: IServiceRepository) { }

    async createService(data: CreateServiceDTO): Promise<Service> {
        return this.serviceRepository.create(data);
    }

    async updateService(id: string, data: UpdateServiceDTO): Promise<Service> {
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new Error('Serviço não encontrado');
        }

        return this.serviceRepository.update(id, data);
    }

    async deleteService(id: string): Promise<void> {
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new Error('Serviço não encontrado');
        }

        return this.serviceRepository.delete(id);
    }

    async getServiceById(id: string): Promise<Service | null> {
        return this.serviceRepository.findById(id);
    }

    async getAllServices(filters?: ServiceFilters): Promise<Service[]> {
        return this.serviceRepository.findAll(filters);
    }

    async getServicesBySector(sectorId: string): Promise<Service[]> {
        return this.serviceRepository.findAll({ sectorId, isActive: true });
    }

    async getActiveServices(): Promise<Service[]> {
        return this.serviceRepository.findAll({ isActive: true });
    }
}
