"use client";

import React, { useEffect, useState } from 'react';
import socketService from '@/lib/socket';
import { useIsAuthenticated } from './use-auth';
import { getAccessToken } from '@/lib/axios';

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook para gerenciar conexão Socket.IO
 */
export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        if (!isAuthenticated) {
            socketService.disconnect();
            setIsConnected(false);
            return;
        }

        // Conectar ao socket
        const token = getAccessToken();
        socketService.connect({ token: token || undefined });

        // Listeners de conexão
        const handleConnect = () => {
            console.log('✅ Socket conectado');
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('❌ Socket desconectado');
            setIsConnected(false);
        };

        const handleError = (data: any) => {
            // Silenced generically as per user request
        };

        socketService.on('socket:connected', handleConnect);
        socketService.on('socket:disconnected', handleDisconnect);
        socketService.on('socket:error', handleError);

        // Verificar se já está conectado
        if (socketService.isSocketConnected()) {
            setIsConnected(true);
        }

        // Cleanup
        return () => {
            socketService.off('socket:connected', handleConnect);
            socketService.off('socket:disconnected', handleDisconnect);
            socketService.off('socket:error', handleError);
        };
    }, [isAuthenticated]);

    return {
        socket: socketService.getSocket(),
        isConnected,
        emit: socketService.emit.bind(socketService),
        on: socketService.on.bind(socketService),
        off: socketService.off.bind(socketService),
    };
}

// ============================================
// HOOKS ESPECÍFICOS
// ============================================


/**
 * Hook para escutar emergências (SOS)
 */
export function useEmergencySocket(callbacks: {
    onAlert?: (data: any) => void;
    onStatusUpdated?: (data: any) => void;
    onAcknowledged?: (data: any) => void;
    onCancelled?: (data: any) => void;
} = {}) {
    const { isConnected } = useSocket();
    const callbacksRef = React.useRef(callbacks);
    callbacksRef.current = callbacks;

    useEffect(() => {
        if (!isConnected) return;

        // Subscrever para receber alertas
        socketService.subscribeSOS();

        const handleAlert = (data: any) => callbacksRef.current.onAlert?.(data);
        const handleStatus = (data: any) => callbacksRef.current.onStatusUpdated?.(data);
        const handleAck = (data: any) => callbacksRef.current.onAcknowledged?.(data);
        const handleCancel = (data: any) => callbacksRef.current.onCancelled?.(data);

        socketService.onSOSAlert(handleAlert);
        socketService.onSOSStatusUpdated(handleStatus);
        socketService.on('sos:acknowledged', handleAck);
        socketService.on('sos:cancelled', handleCancel);

        return () => {
            socketService.unsubscribeSOS();
            socketService.off('sos:alert', handleAlert);
            socketService.off('sos:status-updated', handleStatus);
            socketService.off('sos:acknowledged', handleAck);
            socketService.off('sos:cancelled', handleCancel);
        };
    }, [isConnected]);

    return {
        activeSOS: socketService.getActiveSOS.bind(socketService),
        acknowledgeSOS: socketService.acknowledgeSOS.bind(socketService),
        updateStatus: socketService.updateSOSStatus.bind(socketService),
    };
}

/**
 * Hook para escutar localização de motoristas
 */
export function useDriverLocationSocket(callback: (data: any) => void) {
    const { isConnected } = useSocket();
    const callbackRef = React.useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!isConnected) return;

        // Subscrever para receber localizações de unidades online
        socketService.subscribeUnits();

        const handleLocation = (data: any) => callbackRef.current(data);
        socketService.onDriverLocation(handleLocation);

        return () => {
            socketService.off('driver:location', handleLocation);
        };
    }, [isConnected]);
}

/**
 * Hook para notificações globais
 */
export function useNotificationSocket(callback: (data: any) => void) {
    const { isConnected } = useSocket();

    useEffect(() => {
        if (!isConnected) return;

        socketService.subscribeNotifications();
        socketService.onNotification(callback);

        return () => {
            socketService.unsubscribeNotifications();
            socketService.off('notification:new');
        };
    }, [isConnected, callback]);
}

