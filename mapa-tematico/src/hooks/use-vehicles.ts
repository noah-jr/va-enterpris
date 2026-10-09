import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vehicleService, { VehicleFilters } from '@/lib/services/vehicle.service';

export function useVehicles(filters: VehicleFilters = {}) {
    return useQuery({
        queryKey: ['vehicles', filters],
        queryFn: () => vehicleService.getAll(filters)
    });
}

export function useVehicle(id: string) {
    return useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => vehicleService.getById(id),
        enabled: !!id
    });
}

export function useVerifyVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => vehicleService.verify(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        }
    });
}

export function useDeleteVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => vehicleService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        }
    });
}
