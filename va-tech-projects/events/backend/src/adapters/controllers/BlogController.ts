import { Request, Response } from 'express';
import { PrismaBlogPostRepository } from '../repositories/PrismaBlogPostRepository';

const blogRepository = new PrismaBlogPostRepository();

export class BlogController {
    async create(req: Request, res: Response) {
        try {
            const post = await blogRepository.create(req.body);
            res.status(201).json(post);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const posts = await blogRepository.findAll();
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const post = await blogRepository.findById(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.status(200).json(post);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async addComment(req: any, res: Response) {
        try {
            const { id: post_id } = req.params;
            const { conteudo } = req.body;
            const user_id = req.user.userId;

            const comment = await blogRepository.addComment({
                post_id,
                user_id,
                conteudo
            });

            res.status(201).json(comment);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
