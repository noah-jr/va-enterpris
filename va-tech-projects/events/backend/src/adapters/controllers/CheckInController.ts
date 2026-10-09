import { Request, Response } from 'express';
import { CheckInUseCase } from '../../core/use-cases/CheckInUseCase';
import { PrismaCheckInRepository } from '../repositories/PrismaCheckInRepository';
import { PrismaAuditLogRepository } from '../repositories/PrismaAuditLogRepository';

const checkInRepository = new PrismaCheckInRepository();
const auditLogRepository = new PrismaAuditLogRepository();
const checkInUseCase = new CheckInUseCase(checkInRepository, auditLogRepository);

export class CheckInController {
    async handle(req: any, res: Response) {
        try {
            const { qrCode } = req.body;
            const adminId = req.user.userId;

            const result = await checkInUseCase.execute(qrCode, adminId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
