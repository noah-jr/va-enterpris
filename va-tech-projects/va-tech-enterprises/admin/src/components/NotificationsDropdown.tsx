'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    link?: string;
    createdAt: Date;
}

interface NotificationsDropdownProps {
    count: number;
    onCountChange: (count: number) => void;
}

export default function NotificationsDropdown({ count, onCountChange }: NotificationsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
                onCountChange(Math.max(0, count - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
            });

            if (response.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                onCountChange(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
                const wasUnread = notifications.find((n) => n.id === id && !n.read);
                if (wasUnread) {
                    onCountChange(Math.max(0, count - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-muted dark:text-foreground';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
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

            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notificações</h3>
                    {notifications.some((n) => !n.read) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8 text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">Sem notificações</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-muted transition-colors ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getTypeColor(notification.type)}`}
                                                >
                                                    {notification.type}
                                                </Badge>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="text-sm font-medium leading-tight mb-1">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-tight mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: ptBR,
                                                    })}
                                                </span>
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        Ver
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="p-2 border-t">
                        <Link href="/notifications">
                            <Button variant="ghost" className="w-full text-sm">
                                Ver todas as notificações
                            </Button>
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
