"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User as UserIcon, MessageSquare, Paperclip, FileIcon, Loader2, Bot, Copy, Trash2, Edit2, X, EyeOff, Eye, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: { name: string | null; image: string | null };
    attachmentUrl?: string;
    attachmentType?: string;
    read?: boolean;
}

interface Chat {
    id: string;
    title?: string;
    guestId?: string;
    users: { id: string; name: string | null; email: string; image: string | null }[];
    messages: Message[];
}

export function UserChat({ currentUserId }: { currentUserId: string }) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUserSelector, setShowUserSelector] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string | null; email: string; image: string | null }[]>([]);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [isViewOnce, setIsViewOnce] = useState(false);
    const [viewingOneTimeContent, setViewingOneTimeContent] = useState<string | null>(null);
    const [showMobileChat, setShowMobileChat] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastReceivedMessageId = useRef<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        fetchChats();
        fetchUsers();
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
            const interval = setInterval(() => fetchMessages(activeChat.id), 1000);
            return () => clearInterval(interval);
        }
    }, [activeChat]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const fetchChats = async () => {
        try {
            const res = await fetch("/api/chat");
            const data = await res.json();
            if (Array.isArray(data)) setChats(data);
        } catch (e) {
            console.error("Fetch chats error", e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (Array.isArray(data)) {
                setAvailableUsers(data.filter((u: any) => u.id !== currentUserId));
            }
        } catch (e) {
            console.error("Fetch users error", e);
        }
    };

    const fetchMessages = async (chatId: string) => {
        try {
            const res = await fetch(`/api/chat/${chatId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Check for new messages to notify
                if (data.length > 0) {
                    const lastMsg = data[data.length - 1];
                    // If new message ID is different from last known AND sender is not me
                    if (lastMsg.id !== lastReceivedMessageId.current && lastMsg.senderId !== currentUserId) {
                        lastReceivedMessageId.current = lastMsg.id;

                        // Notify if it's a real new message (not just first load)
                        if (messages.length > 0) {
                            // Toast Notification
                            toast.message(lastMsg.sender.name || "Nova mensagem", {
                                description: lastMsg.content,
                            });

                            // Browser Notification
                            if (Notification.permission === "granted" && document.hidden) {
                                new Notification(`Nova mensagem de ${lastMsg.sender.name || "Alguém"}`, {
                                    body: lastMsg.content,
                                    icon: "/icon.png"
                                });
                            }
                        }
                    }
                }
                setMessages(data);
            }
        } catch (e) {
            console.error("Fetch messages error", e);
        }
    };

    const createNewChat = async (userId: string) => {
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (data.id) {
                await fetchChats();
                const newChat = chats.find(c => c.id === data.id) || data;
                setActiveChat(newChat);
                setShowMobileChat(true);
                setShowUserSelector(false);
            }
        } catch (e) {
            console.error("Create chat error", e);
        }
    };

    const sendMessage = async () => {
        if (!activeChat || !newMessage.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const content = newMessage;
        const isOneTime = isViewOnce;

        // OPTIMISTIC UPDATE: Add message immediately
        if (!editingMessage) {
            const optimisticMsg: Message = {
                id: tempId,
                content: content,
                senderId: currentUserId,
                createdAt: new Date().toISOString(),
                sender: { name: "Eu", image: null },
                attachmentType: isOneTime ? "text_once" : undefined,
                read: false
            };
            setMessages(prev => [...prev, optimisticMsg]);
        } else {
            setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: content } : m));
        }

        setNewMessage("");
        setIsViewOnce(false);
        setEditingMessage(null);
        setLoading(true);

        try {
            if (editingMessage) {
                // UPDATE EXISTING MESSAGE
                const res = await fetch(`/api/chat/message/${editingMessage.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content })
                });
                if (!res.ok) throw new Error("Falha ao editar");
                toast.success("Mensagem editada");
            } else {
                // CREATE NEW MESSAGE
                const otherUser = activeChat.users.find(u => u.id !== currentUserId);
                const res = await fetch(`/api/chat/${activeChat.id}`, {
                    method: "POST",
                    body: JSON.stringify({
                        content: content,
                        receiverId: otherUser?.id,
                        attachmentType: isOneTime ? "text_once" : undefined
                    })
                });

                if (res.ok) {
                    fetchMessages(activeChat.id);
                } else {
                    throw new Error("Falha ao enviar");
                }
            }
        } catch (e) {
            console.error("Send message error", e);
            toast.error("Erro ao enviar mensagem");
            // Revert optimistic update on error
            if (editingMessage) {
                fetchMessages(activeChat.id);
            } else {
                setMessages(prev => prev.filter(m => m.id !== tempId));
            }
            setNewMessage(content);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (msg: Message) => {
        setEditingMessage(msg);
        setNewMessage(msg.content);
        inputRef.current?.focus();
    };

    const cancelEditing = () => {
        setEditingMessage(null);
        setNewMessage("");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeChat) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                const otherUser = activeChat.users.find(u => u.id !== currentUserId);

                let type = file.type.startsWith('image/') ? 'image' :
                    file.type === 'application/pdf' ? 'pdf' : 'file';
                if (isViewOnce) type += '_once';

                const sendRes = await fetch(`/api/chat/${activeChat.id}`, {
                    method: "POST",
                    body: JSON.stringify({
                        content: isViewOnce ? "Mídia de visualização única" : "Enviou um anexo",
                        attachmentUrl: data.url,
                        attachmentType: type,
                        receiverId: otherUser?.id
                    })
                });
                if (sendRes.ok) {
                    fetchMessages(activeChat.id);
                    setIsViewOnce(false);
                }
            }
        } catch (e) {
            console.error("Admin upload error", e);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        // OPTIMISTIC UPDATE: Remove immediately
        const previousMessages = [...messages];
        setMessages(prev => prev.filter(m => m.id !== messageId));

        try {
            const res = await fetch(`/api/chat/message/${messageId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Mensagem apagada");
            } else {
                // If failed, throw error to catch block
                throw new Error("Failed to delete");
            }
        } catch (e) {
            console.error("Delete message error", e);
            toast.error("Erro ao processar pedido");
            setMessages(previousMessages); // Revert
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Texto copiado!");
    };

    const openOneTimeMedia = async (msg: Message) => {
        if (!msg.attachmentUrl) return;
        setViewingOneTimeContent(msg.attachmentUrl);

        // Delete message after viewing (or mark as viewed logic if we had it)
        // Here we delete it from the chat for everyone to simulate view once
        await handleDeleteMessage(msg.id);
    };

    return (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[600px]">
            <Card className={cn(
                "col-span-1 border-border/50 flex flex-col overflow-hidden transition-all duration-300",
                showMobileChat ? "hidden md:flex" : "flex h-full"
            )}>
                <CardHeader className="pb-3 border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Conversas
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setShowUserSelector(!showUserSelector)}
                        >
                            <UserIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <ScrollArea className="h-[520px]">
                    {showUserSelector ? (
                        <div className="p-2 space-y-1">
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                                Selecione um utilizador
                            </div>
                            {availableUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => createNewChat(user.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted"
                                >
                                    <Avatar className="h-10 w-10 border border-border/20">
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback>
                                            <UserIcon className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium text-sm truncate">{user.name || user.email}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {chats.map(chat => {
                                const otherUser = chat.users.find(u => u.id !== currentUserId);
                                const displayName = otherUser?.name || otherUser?.email || chat.title || "Convidado";

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => {
                                            setActiveChat(chat);
                                            setShowMobileChat(true);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeChat?.id === chat.id ? "bg-primary/10" : "hover:bg-muted"
                                            }`}
                                    >
                                        <Avatar className="h-10 w-10 border border-border/20">
                                            <AvatarImage src={otherUser?.image || ""} />
                                            <AvatarFallback>
                                                {chat.guestId ? <MessageSquare className="h-5 w-5 text-blue-500" /> : <UserIcon className="h-5 w-5" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium text-sm truncate">{displayName}</p>
                                            <p className="text-xs text-muted-foreground truncate italic">
                                                {chat.messages[0]?.content || "Sem mensagens"}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            <Card className={cn(
                "col-span-1 md:col-span-2 border-border/50 flex flex-col overflow-hidden transition-all duration-300",
                !showMobileChat ? "hidden md:flex" : "flex h-full"
            )}>
                {activeChat ? (
                    <>
                        <CardHeader className="py-3 border-b border-border/10">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden h-8 w-8 -ml-2"
                                    onClick={() => setShowMobileChat(false)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>
                                        {activeChat.guestId ? <MessageSquare className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-sm">
                                    {activeChat.users.find(u => u.id !== currentUserId)?.name || activeChat.title || "Chat"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 flex flex-col justify-between">
                            <ScrollArea className="h-[430px] p-4">
                                <div className="space-y-4">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId === currentUserId;
                                        const isOneTime = msg.attachmentType?.endsWith('_once');

                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                    {!isMe && (
                                                        <Avatar className="h-6 w-6 border shadow-sm">
                                                            <AvatarFallback className="text-[10px] bg-muted">
                                                                {activeChat.guestId ? <Bot className="h-3 w-3 text-primary" /> : <UserIcon className="h-3 w-3" />}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <ContextMenu>
                                                        <ContextMenuTrigger>
                                                            <div
                                                                className={`relative px-4 py-2.5 rounded-2xl shadow-sm border ${isMe
                                                                    ? "bg-primary text-primary-foreground rounded-br-none border-primary/20"
                                                                    : "bg-background text-foreground rounded-bl-none border-border/50"
                                                                    }`}
                                                            >
                                                                {msg.attachmentUrl && (
                                                                    <div className="mb-2">
                                                                        {isOneTime && !isMe ? (
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="bg-white/10 border-white/20 hover:bg-white/20 text-xs"
                                                                                onClick={() => openOneTimeMedia(msg)}
                                                                            >
                                                                                <EyeOff className="h-3 w-3 mr-2" /> Visualização Única
                                                                            </Button>
                                                                        ) : (
                                                                            msg.attachmentType?.includes('image') ? (
                                                                                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                                                    <img src={msg.attachmentUrl} className={`rounded-lg max-h-60 object-contain bg-black/5 ${isOneTime ? 'blur-md hover:blur-none transition-all' : ''}`} alt="" />
                                                                                </a>
                                                                            ) : (
                                                                                <a
                                                                                    href={msg.attachmentUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-2 p-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
                                                                                >
                                                                                    <div className="p-2 bg-white/20 rounded">
                                                                                        {msg.attachmentType?.includes('pdf') ? (
                                                                                            <div className="relative">
                                                                                                <FileIcon className="h-4 w-4" />
                                                                                                <span className="absolute -bottom-1 -right-1 text-[6px] font-bold bg-red-500 text-white px-0.5 rounded">PDF</span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <FileIcon className="h-4 w-4" />
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="text-xs font-medium truncate max-w-[150px]">
                                                                                        {msg.attachmentType?.includes('pdf') ? 'Ver PDF' : 'Anexo'}
                                                                                    </span>
                                                                                </a>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                                <p className={`text-[9px] mt-1 opacity-60 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                                                    {format(new Date(msg.createdAt), "HH:mm")}
                                                                    {isMe && msg.read && <span className="text-[8px] opacity-70">Lida</span>}
                                                                </p>
                                                                {isOneTime && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
                                                            </div>
                                                        </ContextMenuTrigger>
                                                        <ContextMenuContent>
                                                            <ContextMenuItem onClick={() => copyToClipboard(msg.content)} className="flex items-center gap-2 cursor-pointer">
                                                                <Copy className="h-4 w-4" /> Copiar Texto
                                                            </ContextMenuItem>
                                                            {isMe && (
                                                                <>
                                                                    <ContextMenuItem onClick={() => startEditing(msg)} className="flex items-center gap-2 cursor-pointer">
                                                                        <Edit2 className="h-4 w-4" /> Editar
                                                                    </ContextMenuItem>
                                                                    <ContextMenuItem onClick={() => handleDeleteMessage(msg.id)} className="flex items-center gap-2 text-red-500 hover:text-red-600 cursor-pointer">
                                                                        <Trash2 className="h-4 w-4" /> Apagar Mensagem
                                                                    </ContextMenuItem>
                                                                </>
                                                            )}
                                                        </ContextMenuContent>
                                                    </ContextMenu>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {activeChat.guestId && messages.length > 0 && !messages[messages.length - 1].senderId && (
                                        <div className="flex justify-start items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                            {/* AI Indicator */}
                                            <div className="bg-background border border-border/50 p-2.5 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t border-border/10 bg-muted/30">
                                {editingMessage && (
                                    <div className="flex items-center justify-between bg-yellow-500/10 p-2 rounded-lg mb-2 text-xs text-yellow-500 border border-yellow-500/20">
                                        <span>A editar mensagem...</span>
                                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={cancelEditing}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex gap-2 items-center">
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={isViewOnce ? "text-red-500 bg-red-500/10 rounded-full h-10 w-10" : "rounded-full h-10 w-10 text-muted-foreground hover:text-primary"}
                                        onClick={() => setIsViewOnce(!isViewOnce)}
                                        title="Visualização Única"
                                    >
                                        <EyeOff className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Paperclip className="h-5 w-5" />}
                                    </Button>
                                    <Input
                                        ref={inputRef}
                                        placeholder={editingMessage ? "Editar mensagem..." : "Escreva uma mensagem..."}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                        className="rounded-full bg-background border-none shadow-inner"
                                        disabled={uploading}
                                    />
                                    <Button onClick={sendMessage} disabled={loading || uploading || !newMessage.trim()} size="icon" className="rounded-full h-10 w-10 shrink-0 shadow-lg">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>

                        {/* View Once Dialog */}
                        {viewingOneTimeContent && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewingOneTimeContent(null)}>
                                <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                                    <img src={viewingOneTimeContent} className="max-w-full max-h-full rounded-lg shadow-2xl" alt="View Once" />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p>Selecione um utilizador para iniciar um chat.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
