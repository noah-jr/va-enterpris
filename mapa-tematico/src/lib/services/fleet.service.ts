import api from '../axios';

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
    async getAll(filters: FleetFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get('/fleets', { params });
        return response as any;
    }

    async getById(id: string) {
        const response = await api.get(`/fleets/${id}`);
        return response as any;
    }

    async create(data: Partial<Fleet>) {
        const response = await api.post('/fleets', data);
        return response as any;
    }

    async update(id: string, data: Partial<Fleet>) {
        const response = await api.put(`/fleets/${id}`, data);
        return response as any;
    }

    async delete(id: string) {
        const response = await api.delete(`/fleets/${id}`);
        return response as any;
    }
}

const fleetService = new FleetService();
export default fleetService;
