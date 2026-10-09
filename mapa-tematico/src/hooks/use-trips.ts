import { useQuery } from '@tanstack/react-query';
import tripService, { TripFilters } from '@/lib/services/trip.service';

export function useTrips(filters: TripFilters = {}) {
    return useQuery({
        queryKey: ['trips', filters],
        queryFn: () => tripService.getAll(filters)
    });
}

export function useTrip(id: string) {
    return useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripService.getById(id),
        enabled: !!id
    });
}
