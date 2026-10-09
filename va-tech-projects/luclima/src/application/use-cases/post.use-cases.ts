import type { IPostRepository, CreatePostDTO, UpdatePostDTO, PostFilters } from '@/domain/repositories';
import type { Post } from '@/domain/entities';

export class PostUseCases {
    constructor(private postRepository: IPostRepository) {}

    async getById(id: string): Promise<Post | null> {
        return this.postRepository.findById(id);
    }

    async getBySlug(slug: string): Promise<Post | null> {
        return this.postRepository.findBySlug(slug);
    }

    async getAll(filters?: PostFilters): Promise<Post[]> {
        return this.postRepository.findAll(filters);
    }

    async create(data: CreatePostDTO): Promise<Post> {
        const existing = await this.postRepository.findBySlug(data.slug);
        if (existing) throw new Error('Já existe um post com este slug');
        return this.postRepository.create(data);
    }

    async update(id: string, data: UpdatePostDTO): Promise<Post> {
        const post = await this.postRepository.findById(id);
        if (!post) throw new Error('Post não encontrado');
        if (data.slug && data.slug !== post.slug) {
            const existing = await this.postRepository.findBySlug(data.slug);
            if (existing) throw new Error('Já existe um post com este slug');
        }
        return this.postRepository.update(id, data);
    }

    async delete(id: string): Promise<void> {
        const post = await this.postRepository.findById(id);
        if (!post) throw new Error('Post não encontrado');
        return this.postRepository.delete(id);
    }
}
