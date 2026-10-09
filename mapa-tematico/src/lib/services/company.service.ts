import api from '../axios';

export interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    nif: string;
    address: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING';
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        fleets: number;
        vehicles: number;
        drivers: number;
    };
}

export interface CompanyFilters {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    ownerId?: string;
}

class CompanyService {
    async getAll(filters: CompanyFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get('/companies', { params });
        return response as any;
    }

    async getById(id: string) {
        const response = await api.get(`/companies/${id}`);
        return response as any;
    }

    async create(data: Partial<Company>) {
        const response = await api.post('/companies', data);
        return response as any;
    }

    async update(id: string, data: Partial<Company>) {
        const response = await api.put(`/companies/${id}`, data);
        return response as any;
    }

    async delete(id: string) {
        const response = await api.delete(`/companies/${id}`);
        return response as any;
    }

    async approve(id: string) {
        const response = await api.post(`/companies/${id}/approve`, {});
        return response as any;
    }

    async getWallet(id: string) {
        const response = await api.get(`/companies/${id}/wallet`);
        return response as any;
    }

    async topUp(id: string, amount: number) {
        const response = await api.post(`/companies/${id}/top-up`, { amount });
        return response as any;
    }
}

const companyService = new CompanyService();
export default companyService;
