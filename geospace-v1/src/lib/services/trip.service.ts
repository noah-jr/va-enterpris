import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    private get config() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getAll(filters: TripFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await axios.get(`${API_URL}/trips/admin/list?${params.toString()}`, this.config);
        return response as any;
    }

    async getById(id: string) {
        const response = await axios.get(`${API_URL}/trips/${id}`, this.config);
        return response as any;
    }
}

const tripService = new TripService();
export default tripService;
