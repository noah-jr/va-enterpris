import { Request, Response } from 'express';
import { PrismaNewsletterRepository } from '../repositories/PrismaNewsletterRepository';

const newsletterRepository = new PrismaNewsletterRepository();

export class NewsletterController {
    async subscribe(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const existing = await newsletterRepository.findByEmail(email);
            if (existing) {
                return res.status(400).json({ error: 'E-mail already subscribed' });
            }
            const subscriber = await newsletterRepository.subscribe(email);
            res.status(201).json(subscriber);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const subscribers = await newsletterRepository.findAll();
            res.status(200).json(subscribers);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
