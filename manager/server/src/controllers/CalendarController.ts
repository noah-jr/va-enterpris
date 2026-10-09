import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class CalendarController {
    static async getEvents(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { start, end } = req.query;

            const events = await prisma.calendarEvent.findMany({
                where: {
                    companyId,
                    ...(start && end ? {
                        date: {
                            gte: new Date(start as string),
                            lte: new Date(end as string)
                        }
                    } : {})
                },
                orderBy: { date: 'asc' }
            });
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar eventos' });
        }
    }

    static async createEvent(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { title, type, date, startTime, endTime, location, isVirtual, attendees, description, department, reminder } = req.body;

            const event = await prisma.calendarEvent.create({
                data: {
                    companyId,
                    title,
                    type,
                    date: new Date(date),
                    startTime,
                    endTime,
                    location,
                    isVirtual: Boolean(isVirtual),
                    attendees: Array.isArray(attendees) ? attendees.join(',') : attendees,
                    description,
                    department,
                    reminder: Number(reminder) || 30
                }
            });
            res.status(201).json(event);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar evento' });
        }
    }

    static async updateEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.calendarEvent.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Evento não encontrado' });

            const event = await prisma.calendarEvent.update({
                where: { id: id as string },
                data: {
                    ...req.body,
                    date: req.body.date ? new Date(req.body.date) : undefined,
                    isVirtual: req.body.isVirtual !== undefined ? Boolean(req.body.isVirtual) : undefined,
                }
            });
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar evento' });
        }
    }

    static async deleteEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.calendarEvent.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Evento não encontrado' });

            await prisma.calendarEvent.delete({ where: { id: id as string } });
            res.json({ message: 'Evento removido' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover evento' });
        }
    }
}
