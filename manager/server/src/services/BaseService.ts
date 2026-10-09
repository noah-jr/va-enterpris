import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export abstract class BaseService<T> {
    protected prisma: PrismaClient = prisma;

    constructor() {
    }

    // Define generic methods that can be overridden by specific services.
    abstract getAll(companyId: string): Promise<T[]>;
    abstract getById(id: string, companyId: string): Promise<T | null>;
    abstract create(data: any): Promise<T>;
    abstract update(id: string, companyId: string, data: any): Promise<T | null>;
    abstract delete(id: string, companyId: string): Promise<boolean>;
}
