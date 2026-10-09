import { Request, Response } from 'express';
import { ClientModel } from '../models/ClientModel';

export class ClientController {
    static async index(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const clients = await ClientModel.getAllClients(companyId);
            res.json(clients);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while fetching clients' });
        }
    }

    static async show(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const id = req.params.id as string;

            const client = await ClientModel.getClientById(id, companyId);
            if (!client) return res.status(404).json({ error: 'Client not found' });

            res.json(client);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while fetching client' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { name, nif, email, phone, address, creditLimit } = req.body;

            const newClient = await ClientModel.createClient({
                companyId,
                name,
                nif,
                email,
                phone,
                address,
                creditLimit: creditLimit || 0,
                currentDebt: 0,
                deletedAt: null
            });

            res.status(201).json(newClient);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while creating client' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const id = req.params.id as string;
            const data = req.body;

            const updatedClient = await ClientModel.updateClient(id, companyId, data);
            if (!updatedClient) return res.status(404).json({ error: 'Client not found' });

            res.json(updatedClient);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while updating client' });
        }
    }

    static async destroy(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const id = req.params.id as string;

            const success = await ClientModel.deleteClient(id, companyId);
            if (!success) return res.status(404).json({ error: 'Client not found' });

            res.json({ message: 'Client deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while deleting client' });
        }
    }
}
