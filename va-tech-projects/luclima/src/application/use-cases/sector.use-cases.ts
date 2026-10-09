import type { ISectorRepository, CreateSectorDTO, UpdateSectorDTO, SectorFilters } from '@/domain/repositories';
import type { Sector } from '@/domain/entities';

export class SectorUseCases {
    constructor(private sectorRepository: ISectorRepository) { }

    async createSector(data: CreateSectorDTO): Promise<Sector> {
        // Check if sector with same name already exists
        const existing = await this.sectorRepository.findByName(data.name);
        if (existing) {
            throw new Error('Já existe um sector com este nome');
        }

        return this.sectorRepository.create(data);
    }

    async updateSector(id: string, data: UpdateSectorDTO): Promise<Sector> {
        // Check if sector exists
        const sector = await this.sectorRepository.findById(id);
        if (!sector) {
            throw new Error('Sector não encontrado');
        }

        // If changing name, check if new name is already taken
        if (data.name && data.name !== sector.name) {
            const existing = await this.sectorRepository.findByName(data.name);
            if (existing) {
                throw new Error('Já existe um sector com este nome');
            }
        }

        return this.sectorRepository.update(id, data);
    }

    async deleteSector(id: string): Promise<void> {
        const sector = await this.sectorRepository.findById(id);
        if (!sector) {
            throw new Error('Sector não encontrado');
        }

        return this.sectorRepository.delete(id);
    }

    async getSectorById(id: string): Promise<Sector | null> {
        return this.sectorRepository.findById(id);
    }

    async getAllSectors(filters?: SectorFilters): Promise<Sector[]> {
        return this.sectorRepository.findAll(filters);
    }
}
