import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Unit } from "@prisma/client";

const API_URL = "/units";

/**
 * Hook para obter todas as unidades
 */
export function useUnits() {
    return useQuery<Unit[]>({
        queryKey: ["units"],
        queryFn: async () => {
            const data = await api.get(API_URL);
            return data;
        },
        staleTime: 60 * 1000, // 1 minuto de cache
    });
}

/**
 * Hook para criar unidade
 */
export function useCreateUnit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Unit>) => {
            return await api.post(API_URL, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["units"] });
        }
    });
}

/**
 * Hook para atualizar status de unidade
 */
export function useUpdateUnitStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return await api.patch(`${API_URL}/${id}`, { status });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["units"] });
            // Notificar via Socket.io aqui
        }
    });
}
