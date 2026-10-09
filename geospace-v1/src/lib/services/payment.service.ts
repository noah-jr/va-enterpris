import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getHistory(page = 1, limit = 10) {
        const response = await axios.get(`${API_URL}/payments/history?page=${page}&limit=${limit}`, this.config);
        return response as any;
    }

    async getBalance() {
        const response = await axios.get(`${API_URL}/payments/balance`, this.config);
        return response as any;
    }

    async refund(paymentId: string, reason: string) {
        const response = await axios.post(`${API_URL}/payments/refund`, { paymentId, reason }, this.config);
        return response as any;
    }
}

const paymentService = new PaymentService();
export default paymentService;
