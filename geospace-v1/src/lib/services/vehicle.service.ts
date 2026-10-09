import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    plate: string;
    color: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BANNED' | 'VERIFIED';
    companyId?: string;
    fleetId?: string;
    driverId?: string;
    photo?: string;
    createdAt: string;
    updatedAt: string;
    company?: { name: string };
    fleet?: { name: string };
    driver?: { firstName: string; lastName: string };
}

export interface VehicleFilters {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    companyId?: string;
    fleetId?: string;
    search?: string;
}

class VehicleService {
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getAll(filters: VehicleFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        // Backend uses both /vehicles and /vehicles/management/all
        // For admin list, /vehicles is usually enough
        const response = await axios.get(`${API_URL}/vehicles?${params.toString()}`, this.config);
        return response as any;
    }

    async getById(id: string) {
        const response = await axios.get(`${API_URL}/vehicles/${id}`, this.config);
        return response as any;
    }

    async verify(id: string) {
        const response = await axios.patch(`${API_URL}/vehicles/management/${id}/verify`, {}, this.config);
        return response as any;
    }

    async delete(id: string) {
        const response = await axios.delete(`${API_URL}/vehicles/${id}`, this.config);
        return response as any;
    }
}

const vehicleService = new VehicleService();
export default vehicleService;
