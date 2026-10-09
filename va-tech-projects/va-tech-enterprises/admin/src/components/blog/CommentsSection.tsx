"use client";

import { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    internauta: {
        firstName: string;
        lastName: string;
        image?: string;
    };
}

interface CommentsSectionProps {
    postId: string;
    initialComments: Comment[];
    currentUser: any;
}

export default function CommentsSection({ postId, initialComments, currentUser }: CommentsSectionProps) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error("Precisa de iniciar sessão para comentar.");
            return;
        }
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([comment, ...comments]);
                setNewComment("");
                toast.success("Comentário publicado!");
            } else {
                toast.error("Erro ao publicar comentário.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-16 pt-16 border-t border-border">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold">Comentários ({comments.length})</h2>
            </div>

            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-12">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                            {currentUser.image ? <img src={currentUser.image} className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5 text-accent" />}
                        </div>
                        <div className="flex-1 space-y-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Partilhe a sua opinião..."
                                className="w-full bg-muted/30 border-border/50 rounded-2xl p-4 min-h-[120px] focus:ring-accent/20 resize-none"
                            />
                            <div className="flex justify-end">
                                <Button disabled={submitting || !newComment.trim()} className="rounded-full px-8">
                                    {submitting ? "A enviar..." : <><Send className="w-4 h-4 mr-2" /> Comentar</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-muted/30 p-8 rounded-3xl border border-dashed border-border mb-12 text-center">
                    <p className="text-muted-foreground mb-4">Inicie sessão como Internauta para participar na conversa.</p>
                    <Link href="/login-internauta">
                        <Button variant="outline" className="rounded-full">Entrar para Comentar</Button>
                    </Link>
                </div>
            )}

            <div className="space-y-8">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Ainda não existem comentários. Seja o primeiro a comentar!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                {comment.internauta.image ? (
                                    <img src={comment.internauta.image} className="w-full h-full rounded-full object-cover" alt="" />
                                ) : (
                                    <User className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="bg-muted/20 p-5 rounded-2xl rounded-tl-none border border-border/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm">{comment.internauta.firstName} {comment.internauta.lastName}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('pt-PT')}</span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
