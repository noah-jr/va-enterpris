import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Heart, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function InternautaFavorites() {
    const session = await getSession();
    if (!session || session.user.role !== 'INTERNAUTA') {
        redirect('/login-internauta');
    }

    const internauta = await (prisma.internauta as any).findUnique({
        where: { id: session.user.id },
        include: {
            likes: {
                include: { post: { select: { title: true, slug: true, coverImage: true, excerpt: true } } },
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
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Coleção Pessoal</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                    Favoritos
                </h1>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
                    Os artigos que guardou para ler mais tarde ou que mais gostou.
                </p>
            </header>

            <div className="space-y-6">
                {internauta.likes.length === 0 ? (
                    <div className="bg-card/40 backdrop-blur-xl p-20 rounded-[40px] border border-border/40 text-center space-y-4">
                        <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Ainda não guardou nenhum favorito</h3>
                        <Link href="/blog" className="inline-block text-xs font-black uppercase tracking-widest bg-foreground text-background px-8 py-4 rounded-2xl hover:scale-105 transition-transform">
                            Explorar Artigos
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {internauta.likes.map((like: any) => (
                            <Link key={like.id} href={`/blog/${like.post.slug}`} className="group bg-card/40 backdrop-blur-xl rounded-[48px] border border-border/40 overflow-hidden hover:border-foreground/20 transition-all flex flex-col">
                                <div className="aspect-[16/9] overflow-hidden relative">
                                    <img src={like.post.coverImage || '/placeholder.svg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                    <div className="absolute top-6 right-6">
                                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-2xl">
                                            <Heart className="w-5 h-5 fill-current" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 space-y-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destaque Blog</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-tight group-hover:underline decoration-2">
                                        {like.post.title}
                                    </h2>
                                    <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed">
                                        {like.post.excerpt}
                                    </p>
                                    <div className="pt-6 mt-auto">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 group-hover:gap-4 transition-all">
                                            Ler Agora <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
