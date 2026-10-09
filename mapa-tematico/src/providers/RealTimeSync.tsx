'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socketService from '@/lib/socket';
import { useSocket } from '@/providers/SocketProvider';
import { emergencyKeys } from '@/hooks/use-emergencies';
import { userKeys } from '@/hooks/use-users';

export function RealTimeSync() {
    const queryClient = useQueryClient();
    const { isConnected } = useSocket();

    useEffect(() => {
        if (!isConnected) return;

        // 🚨 Emergencies
        const handleNewEmergency = (data: any) => {
            console.log('RealTime: New Emergency', data);
            queryClient.invalidateQueries({ queryKey: emergencyKeys.all });
        };

        const handleEmergencyUpdate = (data: any) => {
            console.log('RealTime: Emergency Updated', data);
            queryClient.invalidateQueries({ queryKey: emergencyKeys.all });
            if (data.id) {
                queryClient.invalidateQueries({ queryKey: emergencyKeys.detail(data.id) });
            }
        };

        socketService.on('emergency:new', handleNewEmergency);
        socketService.on('emergency:updated', handleEmergencyUpdate);
        socketService.on('emergency:resolved', handleEmergencyUpdate);

        // 👥 Users
        const handleUserUpdate = () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        };

        socketService.on('user:updated', handleUserUpdate);
        socketService.on('user:status-changed', handleUserUpdate);

        // 🚗 Drivers & Monitoring
        const handleDriverLocation = (data: any) => {
            // Usually we update the coordinates in place for the map
            // but we can also invalidate the list if status changed
            queryClient.invalidateQueries({ queryKey: ['monitoring'] });
        };

        socketService.on('driver:location', handleDriverLocation);
        socketService.on('monitoring:driver-status', handleUserUpdate);

        return () => {
            socketService.off('emergency:new', handleNewEmergency);
            socketService.off('emergency:updated', handleEmergencyUpdate);
            socketService.off('emergency:resolved', handleEmergencyUpdate);
            socketService.off('user:updated', handleUserUpdate);
            socketService.off('user:status-changed', handleUserUpdate);
            socketService.off('driver:location', handleDriverLocation);
            socketService.off('monitoring:driver-status', handleUserUpdate);
        };
    }, [isConnected, queryClient]);

    return null;
}
