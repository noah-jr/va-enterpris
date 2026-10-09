import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getTickets(filters: SupportFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await axios.get(`${API_URL}/support/tickets?${params.toString()}`, this.config);
        return response as any;
    }

    async getTicketById(id: string) {
        const response = await axios.get(`${API_URL}/support/tickets/${id}`, this.config);
        return response as any;
    }

    async updateStatus(id: string, status: string, assignedTo?: string) {
        const response = await axios.patch(`${API_URL}/support/tickets/${id}/status`, { status, assignedTo }, this.config);
        return response as any;
    }

    async replyToTicket(id: string, message: string) {
        const response = await axios.post(`${API_URL}/support/tickets/${id}/reply`, { message }, this.config);
        return response as any;
    }
}

const supportService = new SupportService();
export default supportService;
