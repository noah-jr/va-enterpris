import api from '../axios';

export interface Payment {
    id: string;
    tripId: string;
    amount: number;
    currency: string;
    method: 'CASH' | 'WALLET' | 'CARD' | 'STRIPE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    payerId: string;
    payeeId?: string;
    createdAt: string;
}

export interface Wallet {
    balance: number;
    currency: string;
    transactions: any[];
}

class PaymentService {
    async getHistory(page = 1, limit = 10) {
        const response = await api.get('/payments/history', { 
            params: { page, limit } 
        });
        return response as any;
    }

    async getBalance() {
        const response = await api.get('/payments/balance');
        return response as any;
    }

    async refund(paymentId: string, reason: string) {
        const response = await api.post('/payments/refund', { paymentId, reason });
        return response as any;
    }
}

const paymentService = new PaymentService();
export default paymentService;
