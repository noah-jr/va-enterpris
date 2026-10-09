
import { io } from '../index';

export class NotificationService {
    /**
     * Envia notificação para todos os super-administradores do sistema
     */
    static notifySuperAdmin(event: string, payload: any) {
        if (!io) return;
        io.to('superadmin').emit(event, payload);
    }

    /**
     * Envia notificação apenas para uma empresa específica
     */
    static notifyCompany(companyId: string, event: string, payload: any) {
        if (!io) return;
        io.to(`company_${companyId}`).emit(event, payload);
    }

    /**
     * Notificação global (broadcasting) - usar com cautela
     */
    static broadcast(event: string, payload: any) {
        if (!io) return;
        io.emit(event, payload);
    }
}
