"use client";

import { createContext, useContext, useEffect, useState } from "react";
import socketService from "@/lib/socket";
import { getAccessToken } from "@/lib/axios";

interface SocketContextType {
    socket: any | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<any | null>(null);

    useEffect(() => {
        const token = getAccessToken();

        // Connect if token exists
        if (token) {
            socketService.connect({ token });
            setSocket(socketService.getSocket());
        }

        const checkConnection = setInterval(() => {
            const currentSocket = socketService.getSocket();
            if (currentSocket !== socket) {
                setSocket(currentSocket);
            }
            setIsConnected(socketService.isSocketConnected());
        }, 1000);

        return () => {
            clearInterval(checkConnection);
            socketService.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
