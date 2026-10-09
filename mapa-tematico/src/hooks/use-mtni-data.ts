"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useSchools() {
    return useQuery({
        queryKey: ['schools'],
        queryFn: async () => {
            const res = await api.get('/education');
            return ((res as any).schools || res) as any[];
        },
        refetchInterval: 30000,
    });
}

export function useHospitals() {
    return useQuery({
        queryKey: ['hospitals'],
        queryFn: async () => {
            const res = await api.get('/health');
            return ((res as any).hospitals || res) as any[];
        },
        refetchInterval: 30000,
    });
}

export function useDemographics() {
    return useQuery({
        queryKey: ['demographics'],
        queryFn: async () => {
            const res = await api.get('/demographics');
            return ((res as any).demographics || res) as any[];
        },
        refetchInterval: 30000,
    });
}
