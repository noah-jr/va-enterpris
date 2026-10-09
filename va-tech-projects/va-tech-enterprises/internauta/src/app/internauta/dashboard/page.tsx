import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/internauta/ProfileForm";
import { redirect } from "next/navigation";
import { MessageSquare, Heart, Bookmark, Settings, Compass } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function InternautaDashboard() {
    const session = await getSession();
    if (!session || session.user.role !== 'INTERNAUTA') {
        redirect('/login-internauta');
    }

    const internauta = await (prisma.internauta as any).findUnique({
        where: { id: session.user.id },
        include: {
            comments: {
                include: { post: { select: { title: true, slug: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            likes: {
                include: { post: { select: { title: true, slug: true, coverImage: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            _count: {
                select: { comments: true, likes: true }
            }
        }
    });

    if (!internauta) {
        redirect('/login-internauta');
    }

    const contacts = await (prisma.contact as any).findMany({
        where: { email: internauta.email },
        orderBy: { createdAt: 'desc' }
    });

    const latestPosts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 3
    });

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Elegant Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-10 border-border/40 relative">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-8 bg-foreground rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Área do Cliente</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                        Olá, {internauta.firstName}
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
                        Bem-vindo ao seu ecossistema digital. Aqui pode gerir o seu perfil e acompanhar as suas interações.
                    </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none bg-card/40 backdrop-blur-xl px-8 py-5 rounded-[32px] border border-border/50 shadow-2xl shadow-foreground/[0.02] group hover:scale-105 transition-all">
                        <span className="block text-3xl font-black tracking-tighter leading-none">{internauta._count.likes}</span>
                        <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1 block">Favoritos</span>
                    </div>
                    <div className="flex-1 md:flex-none bg-card/40 backdrop-blur-xl px-8 py-5 rounded-[32px] border border-border/50 shadow-2xl shadow-foreground/[0.02] group hover:scale-105 transition-all">
                        <span className="block text-3xl font-black tracking-tighter leading-none">{internauta._count.comments}</span>
                        <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1 block">Reviews</span>
                    </div>
                </div>
            </header>

            <section className="grid lg:grid-cols-12 gap-10 items-start">
                {/* Profile Settings (Main content) */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-foreground/5 to-foreground/[0.02] rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-card/60 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] border border-border/50 shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-background" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Dados de Perfil</h2>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Mantenha a sua conta atualizada</p>
                                </div>
                            </div>
                            <ProfileForm initialData={JSON.parse(JSON.stringify(internauta))} />
                        </div>
                    </div>

                    {/* Dashboard Footer / Lifestyle Banner */}
                    <div className="rounded-[40px] bg-foreground text-background p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                        <div className="relative z-10 space-y-4 text-center md:text-left">
                            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-tight">
                                Descubra o Novo <br />no Blog VA TECH
                            </h3>
                            <p className="text-background/60 font-medium text-sm max-w-xs">Temos novos artigos sobre tecnologia e inovação à sua espera.</p>
                            <Link href="/blog" className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                                Ir para o Blog →
                            </Link>
                        </div>
                        <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-[48px] bg-background/10 backdrop-blur-xl border border-white/10 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-700">
                            <Compass className="w-16 h-16 md:w-24 md:h-24 text-background/20" />
                        </div>
                    </div>
                </div>

                {/* Vertical Sidebar Interaction History */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Contacts / Support Tickets */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                📩 Apoio ao Cliente
                            </h2>
                            <span className="text-[10px] font-bold text-muted-foreground/40">{contacts.length} Mensagens</span>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {contacts.length === 0 ? (
                                <div className="bg-muted/10 p-10 rounded-[40px] border border-dashed border-border/60 text-center">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Sem solicitações</p>
                                </div>
                            ) : (
                                contacts.map((contact: any) => (
                                    <div key={contact.id} className="bg-card/40 backdrop-blur-xl p-6 rounded-[32px] border border-border/40 space-y-4 transition-all hover:bg-card/60">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{new Date(contact.createdAt).toLocaleDateString()}</span>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                                contact.status === 'DONE' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                            )}>
                                                {contact.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">{contact.subject || 'Geral'}</p>
                                            <p className="text-xs font-semibold leading-relaxed line-clamp-2">"{contact.message}"</p>
                                        </div>
                                        {contact.adminResponse && (
                                            <div className="pt-4 border-t border-border/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1 h-1 rounded-full bg-foreground" />
                                                    <p className="text-[9px] font-black text-foreground uppercase tracking-widest">Resposta VA</p>
                                                </div>
                                                <p className="text-xs text-foreground/70 italic leading-relaxed">{contact.adminResponse}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Articles */}
                    <div className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] px-2 italic">
                            ⭐ Guardados Recentemente
                        </h2>
                        <div className="space-y-4">
                            {internauta.likes.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground px-2">Ainda não guardou nenhum artigo.</p>
                            ) : (
                                internauta.likes.map((like: any) => (
                                    <Link key={like.id} href={`/blog/${like.post.slug}`} className="flex items-center gap-4 p-4 rounded-[32px] bg-card/30 border border-border/20 hover:bg-card/50 transition-all group">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                                            <img src={like.post.coverImage || '/placeholder.svg'} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold truncate group-hover:text-foreground transition-colors">{like.post.title}</h4>
                                            <p className="text-[10px] text-muted-foreground mt-1 px-2 py-0.5 rounded-md bg-muted/50 inline-block font-bold">BLOG</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        <div className="pt-6 border-t border-border/20">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] px-2 italic mb-6">
                                📰 Últimas do Blog
                            </h2>
                            <div className="space-y-4">
                                {latestPosts.map((post: any) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-center gap-4 p-4 rounded-[32px] bg-foreground/5 hover:bg-foreground/10 transition-all group">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0 relative">
                                            <img src={post.coverImage || '/placeholder.svg'} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold truncate group-hover:text-foreground transition-colors uppercase tracking-tight italic">{post.title}</h4>
                                            <p className="text-[9px] text-muted-foreground mt-0.5 font-black uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
