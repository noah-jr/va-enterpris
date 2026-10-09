import type { ICategoryRepository, CreateCategoryDTO, UpdateCategoryDTO } from '@/domain/repositories';
import type { Category } from '@/domain/entities';

export class CategoryUseCases {
    constructor(private categoryRepository: ICategoryRepository) {}

    async getById(id: string): Promise<Category | null> {
        return this.categoryRepository.findById(id);
    }

    async getBySlug(slug: string): Promise<Category | null> {
        return this.categoryRepository.findBySlug(slug);
    }

    async getAll(): Promise<Category[]> {
        return this.categoryRepository.findAll();
    }

    async create(data: CreateCategoryDTO): Promise<Category> {
        const existing = await this.categoryRepository.findBySlug(data.slug);
        if (existing) throw new Error('Já existe uma categoria com este slug');
        return this.categoryRepository.create(data);
    }

    async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new Error('Categoria não encontrada');
        return this.categoryRepository.update(id, data);
    }

    async delete(id: string): Promise<void> {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new Error('Categoria não encontrada');
        return this.categoryRepository.delete(id);
    }
}
