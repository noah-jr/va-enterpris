import { IBaseRepository } from "@/core/domain/repositories/interfaces";

// GenericService.ts
export class GenericService<T, ID = string> {
    constructor(protected repository: IBaseRepository<T, ID>) { }

    async create(data: any): Promise<T> {
        // Regras de negócio podem vir aqui
        return this.repository.create!(data);
    }

    async update(id: ID, data: any): Promise<T> {
        return this.repository.update!(id, data);
    }

    async delete(id: ID): Promise<void> {
        return this.repository.delete!(id);
    }

    async getById(id: ID): Promise<T | null> {
        return this.repository.findById!(id);
    }

    async getAll(): Promise<T[]> {
        return this.repository.findAll!();
    }
}

// UnitService.ts
import { Unit } from "@prisma/client";
import { IUnitRepository } from "@/core/domain/repositories/interfaces";

export class UnitService extends GenericService<Unit> {
    constructor(protected unitRepo: IUnitRepository) {
        super(unitRepo);
    }

    async getBySector(sector: string): Promise<Unit[]> {
        return this.unitRepo.findBySector(sector);
    }

    async updateUnitStatus(id: string, status: string): Promise<Unit> {
        // Notificar via Socket.io no futuro
        return this.unitRepo.updateStatus(id, status);
    }
}
