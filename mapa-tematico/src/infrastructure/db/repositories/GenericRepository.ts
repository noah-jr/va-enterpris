import prisma from "@/lib/prisma";
export default prisma;

// GenericRepository.ts
import { IBaseRepository } from "@/core/domain/repositories/interfaces";

export abstract class GenericPrismaRepository<T, ID = string> implements IBaseRepository<T, ID> {
    constructor(protected model: any) { }

    async create(data: any, options?: any): Promise<T> {
        return this.model.create({ data, ...options });
    }

    async update(id: ID, data: any, options?: any): Promise<T> {
        return this.model.update({
            where: { id },
            data,
            ...options
        });
    }

    async delete(id: ID): Promise<void> {
        await this.model.delete({
            where: { id }
        });
    }

    async findById(id: ID, options?: any): Promise<T | null> {
        return this.model.findUnique({
            where: { id },
            ...options
        });
    }

    async findAll(options?: any): Promise<T[]> {
        return this.model.findMany(options);
    }
}
