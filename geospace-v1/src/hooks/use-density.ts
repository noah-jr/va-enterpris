"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { DensityPoint } from "@prisma/client";

const API_URL = "/density-zones";

/**
 * Hook para obter zonas de densidade populacional
 */
export function useDensity() {
    return useQuery<DensityPoint[]>({
        queryKey: ["density"],
        queryFn: async () => {
            const data = await api.get(API_URL);
            return data as unknown as DensityPoint[];
        },
    });
}
