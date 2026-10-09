"use client";

import api from '../axios';

export interface TrafficUpdate {
    id: string;
    roadId: string;
    avgSpeed: number;
    vehicles: number;
    delay?: string;
    status: 'FLUIDO' | 'LENTO' | 'CONGESTIONADO' | 'PARADO';
    updatedAt: string;
    road?: {
        name: string;
        maxSpeed: number;
    };
}

class TrafficService {
    async getTraffic(): Promise<TrafficUpdate[]> {
        const response = await api.get<TrafficUpdate[]>('/traffic');
        return response as any;
    }
}

const trafficService = new TrafficService();
export default trafficService;
