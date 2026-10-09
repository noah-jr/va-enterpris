import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft, Share2, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import LikeButton from "@/components/blog/LikeButton";
import CommentsSection from "@/components/blog/CommentsSection";

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.post.findUnique({ where: { slug } });

    if (!post) {
        return {
            title: 'Artigo não encontrado | VA',
        };
    }

    return {
        title: `${post.title} | Blog VA`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const session = await getSession();

    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            author: true,
            comments: {
                include: {
                    internauta: {
                        select: { firstName: true, lastName: true, image: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            likes: true,
        }
    });

    if (!post) {
        notFound();
    }

    const isLiked = session ? post.likes.some(like => like.internautaId === session.user.id) : false;

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Header />

            <article>
                {/* Article Hero */}
                <div className="relative pt-32 pb-20 bg-muted/20 overflow-hidden">
                    <div className="absolute inset-0 bg-background/60 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center blur-sm opacity-50"
                        style={{ backgroundImage: `url(${post.coverImage || '/placeholder.svg'})` }}
                    />

                    <div className="relative z-20 tesla-container px-4 max-w-4xl text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar ao Blog
                        </Link>

                        <div className="flex flex-wrap justify-center gap-4 mb-6">
                            <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                                {post.tags?.split(',')[0] || 'Geral'}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl md:leading-tight font-bold mb-6 tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                </div>
                                <span>{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(post.createdAt).toLocaleDateString('pt-PT')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>5 min de leitura</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="tesla-container px-4 py-16">
                    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                        {/* Main Content */}
                        <div className="lg:w-2/3">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-border">
                                    <img
                                        src={post.coverImage || '/placeholder.svg'}
                                        alt={post.title}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>

                            {/* Tags, Like & Share */}
                            <div className="mt-12 pt-8 border-t border-border flex flex-wrap justify-between items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <LikeButton
                                        postId={post.id}
                                        initialLikes={post.likes.length}
                                        initialIsLiked={isLiked}
                                        currentUser={session?.user}
                                    />
                                    <div className="flex items-center gap-4 ml-4">
                                        <span className="text-sm font-medium">Partilhar:</span>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 text-muted-foreground">
                                    <Tag className="h-5 w-5" />
                                    {post.tags?.split(',').map(tag => (
                                        <Link key={tag} href="#" className="text-sm hover:text-foreground hover:underline">{tag.trim()}</Link>
                                    ))}
                                </div>
                            </div>

                            {/* Comments Section */}
                            <CommentsSection
                                postId={post.id}
                                initialComments={JSON.parse(JSON.stringify(post.comments))}
                                currentUser={session?.user}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/3 space-y-8">
                            <div className="bg-card p-6 rounded-2xl border border-border">
                                <h3 className="text-lg font-bold mb-4">Sobre o Autor</h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        {post.author.image ? <img src={post.author.image} className="w-full h-full rounded-full" /> : <User className="h-6 w-6 text-muted-foreground" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{post.author.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-2">{post.author.role}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Especialista em criar soluções inovadoras que unem tecnologia e negócio.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border">
                                <h3 className="text-lg font-bold mb-2">Newsletter</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Receba os nossos melhores artigos diretamente no seu email.
                                </p>
                                <form className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="O seu email"
                                        className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <Button size="sm" className="w-full h-9">
                                        Subscrever
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
}
