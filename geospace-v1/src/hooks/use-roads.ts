"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Road } from "@prisma/client";

const API_URL = "/roads";

/**
 * Hook para obter a malha rodoviária
 */
export function useRoads() {
    return useQuery<Road[]>({
        queryKey: ["roads"],
        queryFn: async () => {
            const data = await api.get(API_URL);
            return data as unknown as Road[];
        },
    });
}
