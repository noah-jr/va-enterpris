import PostForm from "@/components/PostForm";
import { PrismaPostRepository } from "@/core/infrastructure/repositories/PrismaPostRepository";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
    const { id } = await params;
    const repo = new PrismaPostRepository();
    const post = await repo.findById(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card p-6 rounded-[25px] border border-border/50 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/posts" className="text-xs font-bold uppercase text-muted-foreground hover:text-primary transition-colors">Blog & Notícias</Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-xs font-bold uppercase text-primary">Edição Profissional</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground dark:text-white">
                        {post.title}
                    </h1>
                </div>
                <Link href="/posts">
                    <Button variant="ghost" className="rounded-xl flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Ver todos os artigos
                    </Button>
                </Link>
            </div>
            <PostForm post={post} />
        </div>
    );
}
