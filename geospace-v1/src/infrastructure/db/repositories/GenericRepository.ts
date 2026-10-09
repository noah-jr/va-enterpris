import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

// GenericRepository.ts
import { IBaseRepository } from "@/core/domain/repositories/interfaces";

export abstract class GenericPrismaRepository<T, ID = string> implements IBaseRepository<T, ID> {
    constructor(protected model: any) { }

    async create(data: any): Promise<T> {
        return this.model.create({ data });
    }

    async update(id: ID, data: any): Promise<T> {
        return this.model.update({
            where: { id },
            data
        });
    }

    async delete(id: ID): Promise<void> {
        await this.model.delete({
            where: { id }
        });
    }

    async findById(id: ID): Promise<T | null> {
        return this.model.findUnique({
            where: { id }
        });
    }

    async findAll(): Promise<T[]> {
        return this.model.findMany();
    }
}
