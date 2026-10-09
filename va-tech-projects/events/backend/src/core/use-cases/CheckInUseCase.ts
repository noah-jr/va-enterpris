import { IOrderRepository } from '../repositories/IOrderRepository';
import { ICheckInRepository } from '../repositories/ICheckInRepository';
import { IAuditLogRepository } from '../repositories/IAuditLogRepository';

export class CheckInUseCase {
    constructor(
        private checkInRepository: ICheckInRepository,
        private auditLogRepository: IAuditLogRepository
    ) { }

    async execute(qrCode: string, adminId: string): Promise<any> {
        const ticket = await this.checkInRepository.findByQrCode(qrCode);

        if (!ticket) {
            throw new Error('Bilhete não encontrado');
        }

        if (ticket.status === 'UTILIZADO') {
            throw new Error('Bilhete já foi utilizado');
        }

        if (ticket.status === 'CANCELADO') {
            throw new Error('Bilhete cancelado');
        }

        await this.checkInRepository.markAsUsed(ticket.id);

        // Auditoria
        await this.auditLogRepository.create({
            user_id: adminId,
            acao: `CHECK-IN: Bilhete ${ticket.id} validado`,
            ip: 'internal',
            antes_depois: { status: 'VALIDO', novo_status: 'UTILIZADO' }
        });

        return { message: 'Check-in realizado com sucesso!', ticket_id: ticket.id };
    }
}
