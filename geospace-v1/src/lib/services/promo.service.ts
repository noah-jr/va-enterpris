import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PromoCode {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_RIDE';
    value: number;
    maxUses?: number;
    usedCount: number;
    minTripAmount?: number;
    maxDiscount?: number;
    validFrom: string;
    validUntil: string;
    status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
    createdAt: string;
}

export interface PromoFilters {
    page?: number;
    limit?: number;
    activeOnly?: boolean;
}

class PromoService {
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getAll(filters: PromoFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await axios.get(`${API_URL}/promo-codes?${params.toString()}`, this.config);
        return response as any;
    }

    async create(data: Partial<PromoCode>) {
        const response = await axios.post(`${API_URL}/promo-codes`, data, this.config);
        return response as any;
    }
}

const promoService = new PromoService();
export default promoService;
