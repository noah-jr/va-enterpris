'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface Message {
    id: string;
    senderName: string;
    senderEmail: string;
    senderAvatar?: string;
    subject: string;
    preview: string;
    read: boolean;
    createdAt: Date;
}

interface MessagesDropdownProps {
    count: number;
    onCountChange: (count: number) => void;
}

export default function MessagesDropdown({ count, onCountChange }: MessagesDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/messages/recent');
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/messages/${id}/read`, {
                method: 'PATCH',
            });

            if (response.ok) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, read: true } : m))
                );
                onCountChange(Math.max(0, count - 1));
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            const response = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== id));
                const wasUnread = messages.find((m) => m.id === id && !m.read);
                if (wasUnread) {
                    onCountChange(Math.max(0, count - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {count > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {count > 9 ? '9+' : count}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-96 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Mensagens</h3>
                    <Link href="/contacts">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            Ver todas
                        </Button>
                    </Link>
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">Sem mensagens</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {messages.map((message) => (
                                <Link
                                    key={message.id}
                                    href={`/contacts?id=${message.id}`}
                                    onClick={() => markAsRead(message.id)}
                                >
                                    <div
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${!message.read ? 'bg-muted/30 border-l-2 border-foreground' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                                                <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                                                <AvatarFallback className="bg-foreground text-background text-xs font-semibold">
                                                    {getInitials(message.senderName)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium truncate">
                                                        {message.senderName}
                                                    </p>
                                                    {!message.read && (
                                                        <div className="h-2 w-2 rounded-full bg-foreground flex-shrink-0 ml-2" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate mb-1">
                                                    {message.subject}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                    {message.preview}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(message.createdAt), {
                                                            addSuffix: true,
                                                            locale: ptBR,
                                                        })}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            deleteMessage(message.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {messages.length > 0 && (
                    <div className="p-2 border-t bg-gray-50 dark:bg-gray-900">
                        <Link href="/contacts">
                            <Button variant="ghost" className="w-full text-sm">
                                <Send className="h-4 w-4 mr-2" />
                                Ver todas as mensagens
                            </Button>
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
