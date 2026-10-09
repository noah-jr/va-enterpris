import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentService from '@/lib/services/payment.service';

export function usePaymentHistory(page = 1, limit = 10) {
    return useQuery({
        queryKey: ['payments', page, limit],
        queryFn: () => paymentService.getHistory(page, limit)
    });
}

export function useWalletBalance() {
    return useQuery({
        queryKey: ['wallet-balance'],
        queryFn: () => paymentService.getBalance()
    });
}

export function useRefundPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
            paymentService.refund(paymentId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
    });
}
