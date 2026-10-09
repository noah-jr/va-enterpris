import api from '../axios';

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
    async getAll(filters: PromoFilters = {}) {
        const response = await api.get('/promo-codes', { params: filters });
        return response as any;
    }

    async create(data: Partial<PromoCode>) {
        const response = await api.post('/promo-codes', data);
        return response as any;
    }
}

const promoService = new PromoService();
export default promoService;
