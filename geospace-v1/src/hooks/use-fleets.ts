import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import fleetService, { FleetFilters } from '@/lib/services/fleet.service';

export function useFleets(filters: FleetFilters = {}) {
    return useQuery({
        queryKey: ['fleets', filters],
        queryFn: () => fleetService.getAll(filters)
    });
}

export function useFleet(id: string) {
    return useQuery({
        queryKey: ['fleet', id],
        queryFn: () => fleetService.getById(id),
        enabled: !!id
    });
}

export function useCreateFleet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => fleetService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fleets'] });
        }
    });
}

export function useUpdateFleet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => fleetService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fleets'] });
            queryClient.invalidateQueries({ queryKey: ['fleet', variables.id] });
        }
    });
}

export function useDeleteFleet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => fleetService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fleets'] });
        }
    });
}
