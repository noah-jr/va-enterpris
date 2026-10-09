"use client";

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './axios';

// ============================================
// CONFIGURAÇÃO
// ============================================

const getSocketUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (envUrl) return envUrl;

    // Default to same-origin in browser
    if (typeof window !== 'undefined') {
        return '';
    }

    return 'http://localhost:3000';
};

const SOCKET_URL = getSocketUrl();

// ============================================
// TIPOS
// ============================================

export interface SocketConfig {
    token?: string;
    autoConnect?: boolean;
}

export interface EmergencyData {
    id: string;
    userId: string;
    userType: 'DRIVER' | 'PASSENGER';
    latitude: number;
    longitude: number;
    address?: string;
    tripId?: string;
    type: string;
    status: 'ACTIVE' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description?: string;
    recordingUrl?: string;
    createdAt: string;
}

// ============================================
// CLASSE SOCKET SERVICE
// ============================================


class SocketService {
    private socket: Socket | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private eventListeners: Map<string, Set<Function>> = new Map();

    /**
     * Conectar ao servidor Socket.IO
     */
    connect(config: SocketConfig = {}): void {
        if (this.socket?.connected) {
            console.log('✅ Socket já conectado');
            return;
        }

        const token = config.token || getAccessToken();

        const socketOptions: any = {
            path: '/api/socket',
            transports: ['polling', 'websocket'], // Try polling first for easier first connection
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
            autoConnect: config.autoConnect !== false,
        };

        console.log(`📡 Iniciando conexão GEOSPACE no caminho: ${socketOptions.path}`);

        // Adicionar autenticação se houver token
        if (token) {
            socketOptions.auth = {
                token: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
            };
        }

        console.log('🔌 Connecting to Socket server...');
        this.socket = io(SOCKET_URL, socketOptions);

        this.setupEventHandlers();
    }

    /**
     * Configurar handlers de eventos do socket
     */
    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Socket conectado:', this.socket?.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emitLocalEvent('socket:connected', { socketId: this.socket?.id });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket desconectado:', reason);
            this.isConnected = false;
            this.emitLocalEvent('socket:disconnected', { reason });

            if (reason === 'io server disconnect') {
                // Servidor desconectou - tentar reconectar
                this.socket?.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Erro de conexão (handshake):', error.message, error);
            this.reconnectAttempts++;
            this.emitLocalEvent('socket:error', {
                error: error.message,
                details: error,
                type: 'CONNECT_ERROR'
            });

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ Máximo de tentativas de reconexão atingido');
                this.emitLocalEvent('socket:max_reconnect_failed', {});
            }
        });

        this.socket.on('error', (err) => {
            // Forensic catch for objects that log as {} but contain data in non-enumerable props
            const errorInfo = {
                message: (err as any)?.message,
                name: (err as any)?.name,
                stack: (err as any)?.stack,
                description: (err as any)?.description,
                type: (err as any)?.type,
                ...err
            };

            console.error('❌ Forensic Socket Error:', errorInfo);
            this.emitLocalEvent('socket:error', {
                error: errorInfo.message || 'Unknown Socket Error',
                details: errorInfo,
                type: 'GENERAL_ERROR'
            });
        });

        // SOS
        this.socket.on('sos:alert', (data: any) => this.emitLocalEvent('sos:alert', data));
        this.socket.on('sos:status-updated', (data: any) => this.emitLocalEvent('sos:status-updated', data));
        this.socket.on('sos:acknowledged', (data: any) => this.emitLocalEvent('sos:acknowledged', data));
        this.socket.on('sos:cancelled', (data: any) => this.emitLocalEvent('sos:cancelled', data));

        // General
        this.socket.on('notification:new', (data: any) => this.emitLocalEvent('notification:new', data));
    }

    /**
     * Desconectar do servidor
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.eventListeners.clear();
            console.log('🔌 Socket desconectado');
        }
    }

    /**
     * Verificar se está conectado
     */
    isSocketConnected(): boolean {
        return this.isConnected && !!this.socket?.connected;
    }

    /**
     * Obter instância do socket
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Emitir evento para o servidor
     */
    emit(event: string, data?: any): void {
        if (!this.socket || !this.isConnected) {
            console.warn(`⚠️ Socket não conectado. Não foi possível emitir: ${event}`);
            return;
        }

        this.socket.emit(event, data);
    }

    /**
     * Escutar evento DESTE SERVIÇO (não diretamente do socket se usar proxy)
     * Mas para simplificar, usaremos o map de listeners interno
     */
    on(event: string, callback: (data: any) => void): void {
        // Armazenar listener
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)?.add(callback);
    }

    /**
     * Remover listener
     */
    off(event: string, callback?: (data: any) => void): void {
        if (callback) {
            this.eventListeners.get(event)?.delete(callback);
        } else {
            this.eventListeners.delete(event);
        }
    }

    // ============================================
    // INTERNAL EMITTER
    // ============================================
    private emitLocalEvent(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach((callback) => callback(data));
        }
    }

    // ============================================
    // SOS Methods
    // ============================================
    subscribeSOS(): void {
        this.emit('sos:subscribe-alerts');
    }

    unsubscribeSOS(): void {
        this.emit('sos:unsubscribe-alerts');
    }

    acknowledgeSOS(emergencyId: string): void {
        this.emit('sos:acknowledge', { emergencyId });
    }

    updateSOSStatus(emergencyId: string, status: 'ACTIVE' | 'RESOLVED' | 'FALSE_ALARM', notes?: string): void {
        this.emit('sos:update-status', { emergencyId, status, notes });
    }

    getActiveSOS(): void {
        this.emit('sos:get-active-alerts');
    }

    onSOSAlert(callback: (data: any) => void): void {
        this.on('sos:alert', callback);
    }

    onSOSStatusUpdated(callback: (data: any) => void): void {
        this.on('sos:status-updated', callback);
    }

    onSOSActiveAlerts(callback: (data: any) => void): void {
        this.on('sos:active-alerts', callback);
    }

    // ============================================
    // Monitoring Methods
    // ============================================

    subscribeUnits(): void {
        this.emit('monitoring:subscribe');
    }

    subscribeNotifications(): void {
        this.emit('notification:subscribe');
    }

    unsubscribeNotifications(): void {
        this.emit('notification:unsubscribe');
    }

    onNotification(callback: (data: any) => void): void {
        this.on('notification:new', callback);
    }

    onDriverLocation(callback: (data: any) => void): void {
        this.on('driver:location', callback);
    }

    onDriverStatus(callback: (data: any) => void): void {
        this.on('driver:status', callback);
    }

    // ============================================
    // CLEANUP
    // ============================================
    offEmergencyListeners(): void {
        this.off('sos:alert');
        this.off('sos:status-updated');
        this.off('sos:acknowledged');
    }

    offLocationListeners(): void {
        this.off('driver:location');
        this.off('driver:status');
    }

    offAllListeners(): void {
        this.eventListeners.clear();
    }
}

const socketService = new SocketService();
export default socketService;
