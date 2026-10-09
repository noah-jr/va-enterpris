"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChatSocket, useSocket } from '@/hooks/use-socket';
import { Send, User, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    read?: boolean;
    senderRole?: string;
}

interface ChatProps {
    tripId: string;
    currentUserId: string;
    className?: string;
}

export const Chat: React.FC<ChatProps> = ({ tripId, currentUserId, className }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Get socket instance for manual listeners
    const { socket } = useSocket();
    // Get sender functions only - pass empty object for callbacks
    const { sendMessage, markRead } = useChatSocket(tripId, {});

    // Helper to scroll to bottom
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            const scrollAreaEntry = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollAreaEntry) {
                (scrollAreaEntry as HTMLElement).scrollTop = (scrollAreaEntry as HTMLElement).scrollHeight;
            } else if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 100);
    }, []);

    const transformMessage = useCallback((data: any): ChatMessage => ({
        id: data.id || Math.random().toString(),
        senderId: data.senderId,
        content: data.content,
        timestamp: data.createdAt || new Date().toISOString(),
        senderRole: data.senderRole,
        read: data.read
    }), []);

    // Set up listeners manually to avoid re-subscription loops
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: any) => {
            const msg = transformMessage(data);
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
            if (msg.senderId !== currentUserId) {
                markRead(msg.id);
            }
        };

        const handleHistory = (data: any) => {
            // Check structure: { tripId: string, messages: [] }
            const msgs = data.messages || data; // Handle both potential formats
            if (Array.isArray(msgs)) {
                setMessages(msgs.map(transformMessage));
                scrollToBottom();
            }
        };

        // Reuse the exact event names that SocketService emits locally
        socket.on('chat:new-message', handleNewMessage);
        socket.on('chat:history', handleHistory);

        return () => {
            socket.off('chat:new-message', handleNewMessage);
            socket.off('chat:history', handleHistory);
        };
    }, [socket, transformMessage, scrollToBottom]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        sendMessage(inputValue);

        // Optimistic update? No, wait for ack 'chat:message-sent' or just 'chat:new-message' which goes to everyone
        // Backend ChatSocketHandler emits 'chat:new-message' to room (excluding sender?)
        // Backend: socket.to(...).emit(...) -> excludes sender.
        // Backend also does: socket.emit('chat:message-sent', ...) -> to sender.

        // So we need to listen to 'chat:message-sent' as well if we want to confirm, 
        // OR just append locally optimistically.
        // Let's listen to 'chat:message-sent' via socket as well?
        // SocketService forwards 'chat:new-message'.
        // Wait, does SocketService forward 'chat:message-sent'?
        // In my `socket.ts` update:
        // this.socket.on('chat:new-message', ...)
        // It does NOT forward 'chat:message-sent'.

        // I should probably update `socket.ts` to forward 'chat:message-sent' or just treat it as 'chat:new-message'.
        // For now, let's just clear input. The backend likely sends 'chat:new-message' to sender too?
        // Checking backend `chat.handler.ts`:
        // socket.to(`chat:${tripId}`).emit('chat:new-message', ...); -> To others
        // socket.emit('chat:message-sent', ...); -> To sender

        // So I NEED to listen to 'chat:message-sent' to see my own messages!
        // I need to update `socket.ts` to forward this event.

        setInputValue('');
    };

    // Add listener for message-sent in useEffect
    useEffect(() => {
        if (!socket) return;

        const handleMessageSent = (data: any) => {
            setMessages(prev => [...prev, transformMessage(data)]);
            scrollToBottom();
        };

        // I need to use the raw socket event name here because I haven't added it to SocketService local emitter yet.
        // `socket` from `useSocket` IS the raw socket (or the wrapped one returning raw socket).
        // `useSocket` returns `{ socket: socketService.getSocket() }`. 
        // So `socket.on` listens to raw events from server.
        // So 'chat:message-sent' will work directly!

        socket.on('chat:message-sent', handleMessageSent);

        return () => {
            socket.off('chat:message-sent', handleMessageSent);
        };
    }, [socket, transformMessage, scrollToBottom]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-background border border-border rounded-lg overflow-hidden tactical-panel", className)}>
            {/* Header */}
            <div className="p-3 bg-muted/40 border-b border-border flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest font-tactical text-primary">Canal_Seguro_Trip::{tripId ? tripId.substring(0, 8) : 'N/A'}</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-mono opacity-50">ATIVO</span>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="flex flex-col gap-3 pb-2">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 opacity-30">
                            <span className="text-[10px] uppercase tracking-widest font-tactical">Sem Mensagens</span>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === currentUserId;
                            return (
                                <div key={msg.id || idx} className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[80%] rounded-lg p-2.5 text-xs relative group border",
                                        isMe
                                            ? "bg-primary/10 border-primary/30 text-foreground ml-4"
                                            : "bg-muted border-border text-foreground mr-4"
                                    )}>
                                        {!isMe && (
                                            <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                                <User className="w-3 h-3" />
                                                <span className="text-[9px] uppercase font-bold tracking-wider">{msg.senderRole || 'Usuário'}</span>
                                            </div>
                                        )}
                                        <p className="leading-relaxed break-words">{msg.content}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                                            <span className="text-[9px] font-mono">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && (
                                                msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 bg-background border-t border-border">
                <div className="flex items-center gap-2 bg-muted/30 rounded-md border border-border p-1.5 focus-within:border-primary/50 transition-colors">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="DIGITE_COMANDO..."
                        className="flex-1 bg-transparent border-none text-xs font-medium focus:outline-none px-2 text-foreground placeholder:text-[10px] placeholder:uppercase placeholder:tracking-wider placeholder:opacity-40"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
