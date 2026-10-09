export interface IAuditLogRepository {
    create(data: {
        user_id: string;
        acao: string;
        ip?: string;
        antes_depois?: any;
    }): Promise<void>;
}
