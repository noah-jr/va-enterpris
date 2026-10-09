export interface DashboardStats {
    data: {
        emergencies: {
            total: number;
            active: number;
            resolved: number;
            falseAlarms: number;
            last24h: number;
            last7days: number;
            last30days: number;
            byType: Array<{ type: string; count: number }>;
            avgResolutionTime: number;
        };
        users: {
            total: number;
            active: number;
            suspended: number;
            banned: number;
        };
        drivers: {
            total: number;
            online: number;
            verified: number;
        };
        trips: {
            total: number;
            active: number;
            completed: number;
            cancelled: number;
        };
        recordings: {
            total: number;
            last24h: number;
        };
        auditLogs: {
            total: number;
            last24h: number;
        };
    };
}

export interface RecentActivity {
    id: string;
    type: string;
    location: string;
    timestamp: string;
    status: string;
}
