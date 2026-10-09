export interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    content: string;
    coverImage?: string | null;
    published: boolean;
    tags?: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}
