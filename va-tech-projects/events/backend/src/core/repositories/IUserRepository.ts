import { User } from '@prisma/client';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
    findAll(): Promise<User[]>;
}
