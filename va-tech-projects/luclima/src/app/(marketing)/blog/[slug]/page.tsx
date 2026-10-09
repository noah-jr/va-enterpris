import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PostUseCases } from '@/application/use-cases/post.use-cases';
import { postRepository } from '@/infrastructure/repositories';
import { Calendar, ArrowLeft, User } from 'lucide-react';
import type { Metadata } from 'next';

const postUseCases = new PostUseCases(postRepository);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await postUseCases.getBySlug(slug);
    if (!post || post.status !== 'PUBLISHED') {
        return { title: 'Artigo não encontrado' };
    }
    return {
        title: post.metaTitle ?? post.title,
        description: post.metaDescription ?? post.excerpt ?? undefined,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await postUseCases.getBySlug(slug);

    if (!post || post.status !== 'PUBLISHED') {
        notFound();
    }

    const postWithRelations = post as typeof post & {
        category?: { id: string; name: string; slug: string };
        author?: { id: string; name: string };
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
               {/* <Header /> */}

            <main className="pt-20">
                <article className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Voltar ao blog
                            </Link>

                            {postWithRelations.category && (
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {postWithRelations.category.name}
                                </span>
                            )}

                            <h1 className="mt-2 text-4xl sm:text-5xl font-bold text-black dark:text-white leading-tight">
                                {post.title}
                            </h1>

                            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Calendar size={18} />
                                    <time dateTime={post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt)}>
                                        {new Date(post.createdAt).toLocaleDateString('pt-PT', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </time>
                                </span>
                                {postWithRelations.author && (
                                    <span className="flex items-center gap-2">
                                        <User size={18} />
                                        {postWithRelations.author.name}
                                    </span>
                                )}
                            </div>

                            {post.image && (
                                <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                                    <img
                                        src={post.image}
                                        alt=""
                                        className="w-full aspect-video object-cover"
                                    />
                                </div>
                            )}

                            <div
                                className="mt-10 text-gray-600 dark:text-gray-400 leading-relaxed space-y-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-black [&_h1]:dark:text-white [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-black [&_h2]:dark:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mt-2 [&_a]:text-black [&_a]:dark:text-white [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                                dangerouslySetInnerHTML={{ __html: post.content || '' }}
                            />
                        </div>
                    </div>
                </article>
            </main>

             {/* <Footer /> */}
        </div>
    );
}
