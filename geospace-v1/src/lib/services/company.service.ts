import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getAll(filters: CompanyFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await axios.get(`${API_URL}/companies?${params.toString()}`, this.config);
        return response as any;
    }

    async getById(id: string) {
        const response = await axios.get(`${API_URL}/companies/${id}`, this.config);
        return response as any;
    }

    async create(data: Partial<Company>) {
        const response = await axios.post(`${API_URL}/companies`, data, this.config);
        return response as any;
    }

    async update(id: string, data: Partial<Company>) {
        const response = await axios.put(`${API_URL}/companies/${id}`, data, this.config);
        return response as any;
    }

    async delete(id: string) {
        const response = await axios.delete(`${API_URL}/companies/${id}`, this.config);
        return response as any;
    }

    async approve(id: string) {
        const response = await axios.post(`${API_URL}/companies/${id}/approve`, {}, this.config);
        return response as any;
    }

    async getWallet(id: string) {
        const response = await axios.get(`${API_URL}/companies/${id}/wallet`, this.config);
        return response as any;
    }

    async topUp(id: string, amount: number) {
        const response = await axios.post(`${API_URL}/companies/${id}/top-up`, { amount }, this.config);
        return response as any;
    }
}

const companyService = new CompanyService();
export default companyService;
