"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Paperclip, Loader2, FileIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    attachmentUrl?: string;
    attachmentType?: string;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Olá! Como podemos ajudar hoje?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [guestId, setGuestId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sons
    const playSound = (type: 'send' | 'receive' | 'upload') => {
        const sounds = {
            send: 'https://www.soundjay.com/buttons/sounds/button-16.mp3',
            receive: 'https://www.soundjay.com/buttons/sounds/button-09.mp3',
            upload: 'https://www.soundjay.com/buttons/sounds/button-10.mp3'
        };
        const audio = new Audio(sounds[type]);
        audio.volume = 0.4;
        audio.play().catch(e => console.log('Audio play failed', e));
    };

    useEffect(() => {
        let gid = localStorage.getItem("chat_guest_id");
        if (!gid) {
            gid = "guest_" + Math.random().toString(36).substring(2, 11);
            localStorage.setItem("chat_guest_id", gid);
        }
        setGuestId(gid);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        if (!guestId) return;
        try {
            const res = await fetch(`/api/chat/history?guestId=${guestId}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    const formatted: Message[] = data.map((m: any) => ({
                        id: m.id,
                        text: m.content,
                        sender: (m.senderId ? "user" : "bot") as "user" | "bot",
                        attachmentUrl: m.attachmentUrl,
                        attachmentType: m.attachmentType,
                        timestamp: new Date(m.createdAt)
                    }));
                    if (formatted.length > messages.length && messages.length > 1) {
                        playSound('receive');
                    }
                    setMessages(formatted.length > 0 ? formatted : messages);

                    // Typing detection (if last message is user and we are waiting for bot)
                    if (formatted.length > 0 && formatted[formatted.length - 1].sender === 'user') {
                        setIsTyping(true);
                    } else {
                        setIsTyping(false);
                    }
                }
            }
        } catch (e) {
            console.error("History fetch error", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, guestId]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        playSound('send');

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.text,
                    previousMessages: messages.slice(-5),
                    guestId: guestId,
                    attachmentUrl: userMsg.attachmentUrl,
                    attachmentType: userMsg.attachmentType
                })
            });

            if (!response.ok) throw new Error("Failed to fetch");

            // Re-fetch after sending to get AI response faster
            setTimeout(fetchHistory, 1000);

        } catch (error) {
            console.error("Chat Error:", error);
            setIsTyping(false);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Desculpe, tive um problema técnico. Pode tentar novamente ou falar connosco no WhatsApp?",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                playSound('upload');

                // Enviar mensagem com anexo
                const userMsg: Message = {
                    id: Date.now().toString(),
                    text: "",
                    sender: "user",
                    timestamp: new Date(),
                    attachmentUrl: data.url,
                    attachmentType: file.type.startsWith('image/') ? 'image' : 'file'
                };

                setMessages((prev) => [...prev, userMsg]);
                setIsTyping(true);

                await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: "",
                        attachmentUrl: data.url,
                        attachmentType: userMsg.attachmentType,
                        guestId: guestId
                    })
                });

                setTimeout(fetchHistory, 2000);
            } else {
                alert("Erro no upload: " + (data.error || "Tente novamente"));
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Erro ao enviar ficheiro.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all hover:scale-110 z-[49] active:scale-90",
                    isOpen && "scale-0 opacity-0 pointer-events-none"
                )}
                aria-label="Abrir Chat"
            >
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
                <MessageCircle className="h-7 w-7" />
            </button>

            {/* Chat Window */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 w-[350px] sm:w-[380px] h-[550px] max-h-[85vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col transition-all z-50 origin-bottom-right duration-300",
                    isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="p-4 border-b bg-neutral-900 text-white rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-full border border-white/20">
                            <Bot className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm leading-none">Assistente Inteligente</h3>
                            <p className="text-[10px] opacity-70 mt-1 flex items-center gap-1 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span>
                                AI Ativa • VA Tech
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-white/10 p-2 rounded-full transition-colors"
                        aria-label="Fechar Chat"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.sender === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm",
                                    msg.sender === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-background text-foreground border rounded-bl-none"
                                )}
                            >
                                {msg.attachmentUrl && (
                                    <div className="mb-2">
                                        {msg.attachmentType === 'image' ? (
                                            <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={msg.attachmentUrl}
                                                    alt="Anexo"
                                                    className="rounded-lg max-w-full h-auto cursor-zoom-in hover:opacity-90 transition-opacity"
                                                />
                                            </a>
                                        ) : (
                                            <a
                                                href={msg.attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 transition-colors"
                                            >
                                                <div className="p-2 bg-primary/20 rounded">
                                                    <FileIcon className="h-4 w-4" />
                                                </div>
                                                <span className="text-[10px] font-medium truncate max-w-[120px]">
                                                    {msg.attachmentUrl.split('/').pop()?.substring(0, 20)}...
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                )}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="bg-background text-foreground border border-border/50 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider ml-1">IA a pensar...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* WhatsApp Quick Action */}
                <div className="px-4 py-2 bg-green-500/5 border-t border-b border-green-500/10 flex items-center justify-between">
                    <span className="text-[11px] text-green-700 font-medium">Prefere falar com um humano?</span>
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-green-600 hover:text-green-700 font-bold text-[11px]"
                        onClick={() => window.open("https://wa.me/244934819272", "_blank")}
                    >
                        Abrir WhatsApp
                    </Button>
                </div>

                {/* Footer */}
                <div className="p-3 bg-background rounded-b-2xl">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2 items-center"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*,.pdf,.doc,.docx"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Paperclip className="h-5 w-5" />}
                        </Button>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escreva aqui..."
                            className="flex-1 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                            disabled={isUploading}
                        />
                        <Button type="submit" size="icon" disabled={!inputValue.trim() || isUploading} className="h-10 w-10 shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}

