import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supportService, { SupportFilters } from '@/lib/services/support.service';

export function useSupportTickets(filters: SupportFilters = {}) {
    return useQuery({
        queryKey: ['support-tickets', filters],
        queryFn: () => supportService.getTickets(filters)
    });
}

export function useUpdateTicketStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, assignedTo }: { id: string; status: string; assignedTo?: string }) =>
            supportService.updateStatus(id, status, assignedTo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
        }
    });
}
