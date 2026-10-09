"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
export interface Road {
    id: string;
    name: string;
    type: string;
    lat: number;
    lng: number;
    province?: string;
    municipality?: string;
}

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
