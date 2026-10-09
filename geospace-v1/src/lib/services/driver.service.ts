import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Driver {
    id: string;
    userId: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        avatar?: string;
    };
    licenseNumber: string;
    licenseExpiry: string;
    status: 'PENDING_VERIFICATION' | 'ONLINE' | 'OFFLINE' | 'ON_TRIP' | 'SUSPENDED';
    rating: number;
    totalTrips: number;
    companyId?: string;
    company?: { name: string };
    vehicle?: {
        make: string;
        model: string;
        plate: string;
    };
    createdAt: string;
}

export interface DriverFilters {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

class DriverService {
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getAll(filters: DriverFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await axios.get(`${API_URL}/drivers?${params.toString()}`, this.config);
        return response as any;
    }

    async getById(id: string) {
        const response = await axios.get(`${API_URL}/drivers/${id}`, this.config);
        return response as any;
    }

    async approve(id: string, approved: boolean, reason?: string) {
        const response = await axios.patch(`${API_URL}/drivers/${id}/approve`, { approved, reason }, this.config);
        return response as any;
    }

    async suspend(id: string, reason?: string) {
        const response = await axios.patch(`${API_URL}/drivers/${id}/suspend`, { reason }, this.config);
        return response as any;
    }

    async verifyDocument(documentId: string, verified: boolean) {
        const response = await axios.patch(`${API_URL}/drivers/documents/${documentId}/verify`, { verified }, this.config);
        return response as any;
    }
}

const driverService = new DriverService();
export default driverService;
