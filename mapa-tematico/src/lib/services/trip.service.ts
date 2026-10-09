import api from '../axios';

export interface Trip {
    id: string;
    passengerId: string;
    driverId?: string;
    passenger: { firstName: string; lastName: string; phone: string };
    driver?: { firstName: string; lastName: string; phone: string };
    vehicle?: { plate: string; make: string; model: string };
    status: 'REQUESTED' | 'ACCEPTED' | 'DRIVER_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_PASSENGER' | 'CANCELLED_BY_DRIVER' | 'CANCELLED_BY_SYSTEM';
    pickupAddress: string;
    destinationAddress: string;
    fare: number;
    distance: number;
    duration: number;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
    createdAt: string;
}

export interface TripFilters {
    page?: number;
    limit?: number;
    status?: string;
    isScheduled?: boolean;
}

class TripService {
    async getAll(filters: TripFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get('/trips/admin/list', { params });
        return response as any;
    }

    async getById(id: string) {
        const response = await api.get(`/trips/${id}`);
        return response as any;
    }
}

const tripService = new TripService();
export default tripService;
