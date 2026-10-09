import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuditService } from '../services/AuditService';


export class PayrollController {
    static async getPayrolls(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { month, year } = req.query;
            const payrolls = await prisma.payroll.findMany({
                where: {
                    companyId,
                    ...(month ? { periodMonth: Number(month) } : {}),
                    ...(year ? { periodYear: Number(year) } : {})
                },
                include: {
                    employee: { select: { name: true, position: true, department: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(payrolls);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar folha de pagamento' });
        }
    }

    static async processPayroll(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { month, year } = req.body;

            const employees = await prisma.employee.findMany({
                where: { companyId, status: 'ACTIVE' }
            });

            const IRT_RATE = 0.08;  // Imposto sobre Rendimento do Trabalho
            const INSS_RATE = 0.03; // Segurança Social

            const payrolls = await Promise.all(employees.map(async (emp) => {
                const baseSalary = emp.salary || 0;
                const deductions = baseSalary * (IRT_RATE + INSS_RATE);
                const netSalary = baseSalary - deductions;

                return prisma.payroll.upsert({
                    where: {
                        employeeId_periodMonth_periodYear: {
                            employeeId: emp.id,
                            periodMonth: Number(month),
                            periodYear: Number(year)
                        }
                    },
                    update: { baseSalary, deductions, netSalary, status: 'PROCESSED' },
                    create: {
                        companyId,
                        employeeId: emp.id,
                        periodMonth: Number(month),
                        periodYear: Number(year),
                        baseSalary,
                        bonuses: 0,
                        deductions,
                        netSalary,
                        status: 'PROCESSED'
                    }
                });
            }));

            await AuditService.log({
                companyId: companyId as string,
                userId: (req as any).userId,
                action: 'PAYROLL_PROCESS',
                entity: 'Payroll',
                entityId: `PERIOD_${month}_${year}`,
                details: `Processamento salarial para ${payrolls.length} colaboradores (${month}/${year})`
            });

            res.json({ processed: payrolls.length, payrolls });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao processar folha de pagamento' });
        }
    }

    static async markPaid(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const payroll = await prisma.payroll.update({
                where: { id: id as string },
                data: { status: 'PAID', paidAt: new Date() },
                include: { employee: { select: { name: true } } }
            });

            await AuditService.log({
                companyId: payroll.companyId as string,
                userId: (req as any).userId,
                action: 'PAYROLL_PAY',
                entity: 'Payroll',
                entityId: payroll.id,
                details: `Pagamento salarial confirmado: ${payroll.employee?.name} - ${payroll.netSalary} AOA`
            });

            res.json(payroll);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao marcar salário como pago' });
        }
    }
}
