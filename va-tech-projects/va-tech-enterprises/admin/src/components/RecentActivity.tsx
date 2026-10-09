"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Contact {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    status: string;
    createdAt: Date;
}

interface Subscriber {
    id: string;
    email: string;
    createdAt: Date;
    active: boolean;
}

interface RecentActivityProps {
    title: string;
    type: 'contacts' | 'subscribers';
    data: (Contact | Subscriber)[];
}

export default function RecentActivity({ title, type, data }: RecentActivityProps) {
    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInMs = now.getTime() - new Date(date).getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return 'Agora';
        if (diffInMins < 60) return `${diffInMins}m`;
        if (diffInHours < 24) return `${diffInHours}h`;
        return `${diffInDays}d`;
    };

    return (
        <Card className="!border-none !bg-white dark:!bg-card shadow-sm rounded-[20px] dark:shadow-none h-full border dark:border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-bold text-foreground dark:text-white">{title}</CardTitle>
                </div>
                <Link href={type === 'contacts' ? '/contacts' : '/newsletter'}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 bg-gray-100 text-primary hover:bg-gray-200 dark:bg-muted dark:text-white dark:hover:bg-muted/80">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-2">
                    {data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhum registro encontrado</p>
                        </div>
                    ) : (
                        data.map((item) => {
                            if (type === 'contacts') {
                                const contact = item as Contact;
                                return (
                                    <div key={contact.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500">
                                                <span className="font-bold text-sm">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground dark:text-white">{contact.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-foreground dark:text-white mb-1">
                                                {getTimeAgo(contact.createdAt)}
                                            </p>
                                            <Badge className={`text-[10px] px-2 py-0.5 h-5 ${contact.status === 'NEW'
                                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-none'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-none dark:bg-white/10 dark:text-white'
                                                }`}>
                                                {contact.status === 'NEW' ? 'Novo' : contact.status === 'READ' ? 'Lido' : 'Resp.'}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            } else {
                                const subscriber = item as Subscriber;
                                return (
                                    <div key={subscriber.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 text-green-500">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground dark:text-white truncate max-w-[150px] sm:max-w-[200px]">{subscriber.email}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Subscrito {getTimeAgo(subscriber.createdAt)} atrás
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            {subscriber.active ? (
                                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-500/20">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-500/20">
                                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

