import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import promoService, { PromoFilters } from '@/lib/services/promo.service';

export function usePromos(filters: PromoFilters = {}) {
    return useQuery({
        queryKey: ['promos', filters],
        queryFn: () => promoService.getAll(filters)
    });
}

export function useCreatePromo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => promoService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promos'] });
        }
    });
}
