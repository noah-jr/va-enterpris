import { BlogPost, Comment } from '@prisma/client';

export type CreateBlogPostDTO = {
    titulo: string;
    conteudo: string;
    image_url?: string;
};

export interface IBlogPostRepository {
    create(data: CreateBlogPostDTO): Promise<BlogPost>;
    findAll(): Promise<BlogPost[]>;
    findById(id: string): Promise<(BlogPost & { comments: Comment[] }) | null>;
    update(id: string, data: Partial<BlogPost>): Promise<BlogPost>;
    delete(id: string): Promise<void>;
    addComment(data: { post_id: string; user_id: string; conteudo: string }): Promise<Comment>;
}
