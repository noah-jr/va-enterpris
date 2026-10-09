import { Post } from "../entities/Post";

export interface IPostRepository {
    findAll(options?: { publishedOnly?: boolean; search?: string; status?: string; page?: number; limit?: number }): Promise<Post[]>;
    count(options?: { publishedOnly?: boolean; search?: string; status?: string }): Promise<number>;
    findById(id: string): Promise<Post | null>;
    findBySlug(slug: string): Promise<Post | null>;
    create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
    update(id: string, data: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Post>;
    delete(id: string): Promise<void>;
}
