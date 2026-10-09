import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class TicketController {
    // ── Criar ticket (cliente) ──────────────────────────────────────────────
    static async create(req: Request, res: Response) {
        try {
            const { subject, category, priority, message } = req.body;
            const companyId = req.companyId!;
            const userId    = req.user?.id;

            if (!subject || !message) {
                return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' });
            }

            const ticket = await prisma.supportTicket.create({
                data: {
                    companyId,
                    userId,
                    subject,
                    category:  category  || 'GENERAL',
                    priority:  priority  || 'MEDIUM',
                    status:    'OPEN',
                    messages:  {
                        create: {
                            content:    message,
                            senderRole: 'CLIENT',
                            userId,
                        }
                    }
                },
                include: { messages: true }
            });

            res.status(201).json(ticket);
        } catch (error) {
            console.error('TicketController.create:', error);
            res.status(500).json({ error: 'Erro ao criar ticket.' });
        }
    }

    // ── Listar tickets da empresa (cliente) ─────────────────────────────────
    static async list(req: Request, res: Response) {
        try {
            const companyId = req.companyId!;
            const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

            const tickets = await prisma.supportTicket.findMany({
                where:   isSuperAdmin ? {} : { companyId },
                include: {
                    messages: { orderBy: { createdAt: 'asc' } },
                    company:  { select: { name: true } },
                },
                orderBy: { updatedAt: 'desc' },
            });

            res.json(tickets);
        } catch (error) {
            console.error('TicketController.list:', error);
            res.status(500).json({ error: 'Erro ao listar tickets.' });
        }
    }

    // ── Detalhes de um ticket ───────────────────────────────────────────────
    static async getOne(req: Request, res: Response) {
        try {
            const id           = req.params.id as string;
            const companyId    = req.companyId!;
            const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

            const ticket = await prisma.supportTicket.findFirst({
                where:   isSuperAdmin ? { id } : { id, companyId },
                include: {
                    messages: { orderBy: { createdAt: 'asc' } },
                    company:  { select: { name: true, email: true } },
                },
            });

            if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });
            res.json(ticket);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao obter ticket.' });
        }
    }

    // ── Responder a um ticket (admin ou cliente) ────────────────────────────
    static async reply(req: Request, res: Response) {
        try {
            const id           = req.params.id as string;
            const { message }  = req.body;
            const companyId    = req.companyId!;
            const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
            const userId       = req.user?.id;

            if (!message) return res.status(400).json({ error: 'Mensagem é obrigatória.' });

            const ticket = await prisma.supportTicket.findFirst({
                where: isSuperAdmin ? { id } : { id, companyId },
            });
            if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });

            const msg = await prisma.ticketMessage.create({
                data: {
                    ticketId:   id,
                    content:    message,
                    senderRole: isSuperAdmin ? 'ADMIN' : 'CLIENT',
                    userId,
                }
            });

            // Auto-update status
            const newStatus = isSuperAdmin ? 'IN_PROGRESS' : ticket.status;
            await prisma.supportTicket.update({
                where: { id },
                data:  { status: newStatus, updatedAt: new Date() },
            });

            res.json(msg);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao responder ticket.' });
        }
    }

    // ── Atualizar estado (admin) ────────────────────────────────────────────
    static async updateStatus(req: Request, res: Response) {
        try {
            const id       = req.params.id as string;
            const { status } = req.body;

            const allowed = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            if (!allowed.includes(status)) {
                return res.status(400).json({ error: 'Estado inválido.' });
            }

            const ticket = await prisma.supportTicket.update({
                where: { id },
                data:  { status },
            });
            res.json(ticket);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar estado.' });
        }
    }

    // ── Newsletter subscribe (público) ──────────────────────────────────────
    static async newsletter(req: Request, res: Response) {
        try {
            const { email, name, company, type } = req.body;
            if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });

            const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
            if (existing) return res.status(409).json({ error: 'Email já registado.' });

            const sub = await prisma.newsletterSubscriber.create({
                data: { 
                    email, 
                    name, 
                    company, 
                    type: type || 'NEWSLETTER' 
                } as any
            });
            res.status(201).json({ ok: true, id: sub.id });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao subscrever newsletter.' });
        }
    }

    // ── Contacto (público) ──────────────────────────────────────────────────
    static async contact(req: Request, res: Response) {
        try {
            const { name, email, company, phone, subject, message } = req.body;
            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios.' });
            }

            const contact = await prisma.contactMessage.create({
                data: { name, email, company, phone, subject, message }
            });
            res.status(201).json({ ok: true, id: contact.id });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao enviar mensagem.' });
        }
    }

    // ── Listar contactos (super admin) ──────────────────────────────────────
    static async listContacts(_req: Request, res: Response) {
        try {
            const contacts = await prisma.contactMessage.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(contacts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar contactos.' });
        }
    }

    // ── Listar subscribers newsletter (super admin) ─────────────────────────
    static async listSubscribers(_req: Request, res: Response) {
        try {
            const subs = await prisma.newsletterSubscriber.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(subs);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar subscribers.' });
        }
    }
}
