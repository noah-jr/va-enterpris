"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    postId: string;
    initialLikes: number;
    initialIsLiked: boolean;
    currentUser: any;
}

export default function LikeButton({ postId, initialLikes, initialIsLiked, currentUser }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (!currentUser) {
            toast.error("Inicie sessão para gostar deste artigo.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: "POST",
            });

            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.isLiked);
                setLikes(prev => data.isLiked ? prev + 1 : prev - 1);
            } else {
                toast.error("Erro ao processar o seu gosto.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={loading}
            className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300",
                isLiked
                    ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-lg shadow-red-500/10"
                    : "bg-muted/30 border-border/50 text-muted-foreground hover:border-red-500/50 hover:text-red-500"
            )}
        >
            <Heart className={cn("w-5 h-5 transition-transform", isLiked && "fill-current scale-110")} />
            <span className="font-semibold">{likes}</span>
        </button>
    );
}
