"use client";

import { useQuery } from '@tanstack/react-query';
import trafficService from '@/lib/services/traffic.service';

export const trafficKeys = {
    all: ['traffic'] as const,
};

export function useTraffic() {
    return useQuery({
        queryKey: trafficKeys.all,
        queryFn: () => trafficService.getTraffic(),
        refetchInterval: 30000,
    });
}
