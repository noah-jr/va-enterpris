import api from '../axios';

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
    async getAll(filters: DriverFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get('/drivers', { params });
        return response as any;
    }

    async getById(id: string) {
        const response = await api.get(`/drivers/${id}`);
        return response as any;
    }

    async approve(id: string, approved: boolean, reason?: string) {
        const response = await api.patch(`/drivers/${id}/approve`, { approved, reason });
        return response as any;
    }

    async suspend(id: string, reason?: string) {
        const response = await api.patch(`/drivers/${id}/suspend`, { reason });
        return response as any;
    }

    async verifyDocument(documentId: string, verified: boolean) {
        const response = await api.patch(`/drivers/documents/${documentId}/verify`, { verified });
        return response as any;
    }
}

const driverService = new DriverService();
export default driverService;
