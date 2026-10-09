"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, ExternalLink, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    link?: string;
    createdAt: Date;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const { toast } = useToast();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as notificações.",
                variant: "destructive",
            });
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
                toast({
                    title: "Sucesso",
                    description: "Notificação marcada como lida.",
                });
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
            });

            if (response.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                toast({
                    title: "Sucesso",
                    description: "Todas as notificações marcadas como lidas.",
                });
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
                toast({
                    title: "Sucesso",
                    description: "Notificação removida.",
                });
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
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground dark:text-white">Notificações</h2>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie todas as suas atualizações e alertas.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-foreground text-background hover:opacity-90' : ''}
                    >
                        Todas
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        onClick={() => setFilter('unread')}
                        className={filter === 'unread' ? 'bg-foreground text-background hover:opacity-90' : ''}
                    >
                        Não Lidas
                    </Button>
                    {notifications.some(n => !n.read) && (
                        <Button variant="outline" onClick={markAllAsRead}>
                            <Check className="mr-2 h-4 w-4" />
                            Marcar tudo como lido
                        </Button>
                    )}
                </div>
            </div>

            <Card className="!border-none !bg-white dark:!bg-[#1a1a1a] shadow-sm rounded-[20px] dark:shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground dark:text-white flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Lista de Notificações
                        <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white">
                            {filteredNotifications.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
                            <p className="mt-2 text-gray-500">Carregando notificações...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Nenhuma notificação encontrada</p>
                            <p className="text-sm">Você está atualizado!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-transparent transition-all hover:bg-gray-50 dark:hover:bg-white/5 ${!notification.read ? 'bg-muted/30 border-l-4 border-l-foreground' : 'bg-transparent'
                                        }`}
                                >
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getTypeColor(notification.type)}`}>
                                        <Bell className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-bold ${!notification.read ? 'text-foreground dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {notification.message}
                                        </p>

                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                className="inline-flex items-center text-sm font-medium text-foreground hover:opacity-70 mt-2 underline"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                Ver detalhes <ExternalLink className="ml-1 h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>

                                    <div className="flex sm:flex-col gap-2 self-start sm:self-center">
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 rounded-full p-0 text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/10"
                                                onClick={() => markAsRead(notification.id)}
                                                title="Marcar como lida"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 rounded-full p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20"
                                            onClick={() => deleteNotification(notification.id)}
                                            title="Remover"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
