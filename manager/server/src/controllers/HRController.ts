import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class HRController {
    static async getEmployees(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const employees = await prisma.employee.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(employees);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar funcionários' });
        }
    }

    static async createEmployee(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { salary, hireDate, photo, ...employeeData } = req.body;
            const file = (req as any).file;
            
            const newEmployee = await prisma.employee.create({
                data: {
                    ...employeeData,
                    companyId,
                    salary: Number(salary) || 0,
                    hireDate: hireDate ? new Date(hireDate) : undefined,
                    photoUrl: file ? file.path : undefined
                }
            });
            res.status(201).json(newEmployee);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar funcionário' });
        }
    }

    static async updateEmployee(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { salary, hireDate, photo, ...updateData } = req.body;
            const file = (req as any).file;

            const updatedEmployee = await prisma.employee.update({
                where: { id: id as string },
                data: {
                    ...updateData,
                    salary: salary ? Number(salary) : undefined,
                    hireDate: hireDate ? new Date(hireDate) : undefined,
                    photoUrl: file ? file.path : undefined
                }
            });
            res.json(updatedEmployee);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar funcionário' });
        }
    }

    static async deleteEmployee(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await prisma.employee.delete({
                where: { id: id as string }
            });
            res.json({ message: 'Funcionário removido com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover funcionário' });
        }
    }
}
