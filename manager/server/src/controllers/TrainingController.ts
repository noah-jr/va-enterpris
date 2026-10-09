import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class TrainingController {
    static async getCourses(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const courses = await prisma.trainingCourse.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(courses);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar cursos.' });
        }
    }

    static async createCourse(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { title, category, description, instructor, duration, status, rating, enrolled } = req.body;

            const course = await prisma.trainingCourse.create({
                data: {
                    companyId,
                    title,
                    category,
                    description,
                    instructor,
                    duration,
                    status: status || 'ACTIVE',
                    rating: rating ? Number(rating) : 5.0,
                    enrolled: enrolled ? Number(enrolled) : 0
                }
            });
            res.status(201).json(course);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar curso.' });
        }
    }

    static async updateCourse(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const companyId = (req as any).companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.trainingCourse.findFirst({ where: { id, companyId } });
            if (!existing) return res.status(404).json({ error: 'Curso não encontrado.' });

            const course = await prisma.trainingCourse.update({
                where: { id },
                data: req.body
            });
            res.json(course);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar curso.' });
        }
    }

    static async deleteCourse(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const companyId = (req as any).companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.trainingCourse.findFirst({ where: { id, companyId } });
            if (!existing) return res.status(404).json({ error: 'Curso não encontrado.' });

            await prisma.trainingCourse.delete({ where: { id } });
            res.json({ message: 'Curso removido com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao remover curso.' });
        }
    }

    static async getLessons(req: Request, res: Response) {
        try {
            const { courseId } = req.params as { courseId: string };
            const companyId = (req as any).companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const course = await prisma.trainingCourse.findFirst({ where: { id: courseId, companyId } });
            if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

            const lessons = await prisma.trainingLesson.findMany({
                where: { courseId },
                orderBy: { order: 'asc' }
            });
            res.json(lessons);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar aulas.' });
        }
    }

    static async createLesson(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { courseId, title, content, duration, order } = req.body;

            const course = await prisma.trainingCourse.findFirst({ where: { id: courseId, companyId } });
            if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

            const lesson = await prisma.trainingLesson.create({
                data: {
                    courseId,
                    title,
                    content,
                    duration,
                    order: order ? Number(order) : 1
                }
            });
            res.status(201).json(lesson);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar aula.' });
        }
    }

    static async deleteLesson(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const companyId = (req as any).companyId as string;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const lesson = await prisma.trainingLesson.findUnique({
                where: { id },
                include: { course: true }
            }) as any;

            if (!lesson || lesson.course?.companyId !== companyId) {
                return res.status(404).json({ error: 'Aula não encontrada.' });
            }

            await prisma.trainingLesson.delete({ where: { id } });
            res.json({ message: 'Aula removida com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao remover aula.' });
        }
    }
}
