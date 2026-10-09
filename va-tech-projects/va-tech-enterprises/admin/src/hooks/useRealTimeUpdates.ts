'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook para atualizar dados em tempo real usando polling
 * @param callback - Função a ser executada periodicamente
 * @param interval - Intervalo em milissegundos (padrão: 30000 = 30 segundos)
 */
export function useRealTimeUpdates(callback: () => void | Promise<void>, interval: number = 30000) {
    const router = useRouter();

    const refresh = useCallback(async () => {
        try {
            await callback();
            router.refresh(); // Atualiza server components
        } catch (error) {
            console.error('Error in real-time update:', error);
        }
    }, [callback, router]);

    useEffect(() => {
        // Execute immediately
        refresh();

        // Set up interval
        const intervalId = setInterval(refresh, interval);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [refresh, interval]);
}

/**
 * Hook para criar notificações do sistema
 */
export async function createNotification(
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    link?: string
) {
    try {
        const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, title, message, link }),
        });

        if (!response.ok) {
            throw new Error('Failed to create notification');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}
