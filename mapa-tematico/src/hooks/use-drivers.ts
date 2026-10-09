import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import driverService, { DriverFilters } from '@/lib/services/driver.service';

export function useDrivers(filters: DriverFilters = {}) {
    return useQuery({
        queryKey: ['drivers', filters],
        queryFn: () => driverService.getAll(filters)
    });
}

export function useDriver(id: string) {
    return useQuery({
        queryKey: ['driver', id],
        queryFn: () => driverService.getById(id),
        enabled: !!id
    });
}

export function useApproveDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, approved, reason }: { id: string; approved: boolean; reason?: string }) =>
            driverService.approve(id, approved, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        }
    });
}

export function useSuspendDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            driverService.suspend(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        }
    });
}
