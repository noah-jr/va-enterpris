"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Incident } from "@prisma/client";

const API_URL = "/incidents";

/**
 * Hook para obter todos os incidentes
 */
export function useIncidents() {
    return useQuery<Incident[]>({
        queryKey: ["incidents"],
        queryFn: async () => {
            const data = await api.get(API_URL);
            return data as unknown as Incident[];
        },
        refetchInterval: 10000, // 10 segundos
    });
}

/**
 * Hook para criar incidente
 */
export function useCreateIncident() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Incident>) => {
            return await api.post(API_URL, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
        }
    });
}

/**
 * Hook para atualizar status de incidente
 */
export function useUpdateIncidentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return await api.patch(`${API_URL}/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
        }
    });
}
