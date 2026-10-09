import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Fleet {
    id: string;
    name: string;
    companyId: string;
    company?: {
        name: string;
    };
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
    _count?: {
        vehicles: number;
        drivers: number;
    };
}

export interface FleetFilters {
    page?: number;
    limit?: number;
    companyId?: string;
    search?: string;
}

class FleetService {
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getAll(filters: FleetFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await axios.get(`${API_URL}/fleets?${params.toString()}`, this.config);
        return response as any;
    }

    async getById(id: string) {
        const response = await axios.get(`${API_URL}/fleets/${id}`, this.config);
        return response as any;
    }

    async create(data: Partial<Fleet>) {
        const response = await axios.post(`${API_URL}/fleets`, data, this.config);
        return response as any;
    }

    async update(id: string, data: Partial<Fleet>) {
        const response = await axios.put(`${API_URL}/fleets/${id}`, data, this.config);
        return response as any;
    }

    async delete(id: string) {
        const response = await axios.delete(`${API_URL}/fleets/${id}`, this.config);
        return response as any;
    }
}

const fleetService = new FleetService();
export default fleetService;
