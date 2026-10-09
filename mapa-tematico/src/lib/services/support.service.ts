import api from '../axios';

export interface SupportTicket {
    id: string;
    userId: string;
    user: { firstName: string; lastName: string; email: string };
    category: 'TRIP_ISSUE' | 'PAYMENT_ISSUE' | 'ACCOUNT_ISSUE' | 'TECHNICAL_ISSUE' | 'OTHER';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    subject: string;
    description: string;
    tripId?: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SupportFilters {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
}

class SupportService {
    async getTickets(filters: SupportFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get('/support/tickets', { params });
        return response as any;
    }

    async getTicketById(id: string) {
        const response = await api.get(`/support/tickets/${id}`);
        return response as any;
    }

    async updateStatus(id: string, status: string, assignedTo?: string) {
        const response = await api.patch(`/support/tickets/${id}/status`, { status, assignedTo });
        return response as any;
    }

    async replyToTicket(id: string, message: string) {
        const response = await api.post(`/support/tickets/${id}/reply`, { message });
        return response as any;
    }
}

const supportService = new SupportService();
export default supportService;
