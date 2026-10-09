import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MessageSquare, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function InternautaActivity() {
    const session = await getSession();
    if (!session || session.user.role !== 'INTERNAUTA') {
        redirect('/login-internauta');
    }

    const internauta = await (prisma.internauta as any).findUnique({
        where: { id: session.user.id },
        include: {
            comments: {
                include: { post: { select: { title: true, slug: true, coverImage: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!internauta) {
        redirect('/login-internauta');
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="space-y-2 border-b pb-10 border-border/40">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-8 bg-foreground rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">O Meu Histórico</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                    Interações
                </h1>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
                    Acompanhe os seus comentários e reviews nos nossos artigos.
                </p>
            </header>

            <div className="space-y-6">
                {internauta.comments.length === 0 ? (
                    <div className="bg-card/40 backdrop-blur-xl p-20 rounded-[40px] border border-border/40 text-center space-y-4">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Ainda não comentou nenhum artigo</h3>
                        <Link href="/blog" className="inline-block text-xs font-black uppercase tracking-widest bg-foreground text-background px-8 py-4 rounded-2xl hover:scale-105 transition-transform">
                            Visitar o Blog
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {internauta.comments.map((comment: any) => (
                            <div key={comment.id} className="group bg-card/40 backdrop-blur-xl p-8 rounded-[40px] border border-border/40 hover:border-foreground/20 transition-all flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-32 h-32 rounded-3xl overflow-hidden bg-muted flex-shrink-0 border border-border/20">
                                    <img src={comment.post.coverImage || '/placeholder.svg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-foreground/5 rounded-full text-muted-foreground">ARTIGO</span>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                                        {comment.post.title}
                                    </h2>
                                    <p className="text-muted-foreground font-medium italic border-l-2 border-foreground/10 pl-6 py-2">
                                        "{comment.content}"
                                    </p>
                                    <div className="pt-4">
                                        <Link href={`/blog/${comment.post.slug}`} className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all">
                                            Ver Artigo original <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
