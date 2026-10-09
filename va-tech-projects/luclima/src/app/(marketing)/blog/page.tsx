'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Calendar, FolderOpen, ArrowRight, User } from 'lucide-react';

export default function BlogPage() {
    const [filterCategoryId, setFilterCategoryId] = useState<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['posts', 'PUBLISHED', filterCategoryId],
        queryFn: async () => {
            const params = new URLSearchParams({ status: 'PUBLISHED' });
            if (filterCategoryId) params.set('categoryId', filterCategoryId);
            const response = await fetch(`/api/posts?${params.toString()}`);
            if (!response.ok) throw new Error('Erro ao carregar artigos');
            return response.json();
        },
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await fetch('/api/categories');
            if (!response.ok) return { categories: [] };
            return response.json();
        },
    });

    const posts = data?.posts ?? [];
    const categories = categoriesData?.categories ?? [];

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors">
               {/* <Header /> */}

            <main className="pt-24">
                {/* Hero Section */}
                <section className="py-24 relative overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,#2563eb_0%,transparent_50%)]" />
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex items-center justify-center space-x-2 mb-6">
                                <div className="w-12 h-[2px] bg-black" />
                                <span className="text-black font-black uppercase tracking-[0.2em] text-xs">Knowledge Base</span>
                                <div className="w-12 h-[2px] bg-black" />
                            </div>
                            <h1 className="font-serif text-5xl sm:text-7xl font-black text-black dark:text-white mb-6 tracking-tighter">
                                Dicas e <span className="text-black italic">Inovação.</span>
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                                Explore o nosso guia completo sobre climatização, eficiência energética e as melhores práticas para a sua saúde.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Categories Filter */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-3xl mx-auto">
                                <button
                                    type="button"
                                    onClick={() => setFilterCategoryId('')}
                                    className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!filterCategoryId
                                        ? 'bg-black text-white shadow-lg shadow-black/20'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    Todos os Temas
                                </button>
                                {categories.map((cat: { id: string; name: string }) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFilterCategoryId(cat.id)}
                                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterCategoryId === cat.id
                                            ? 'bg-black text-white shadow-lg shadow-black/20'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="text-center py-20">
                                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black border-r-transparent" />
                                <p className="mt-6 text-xs font-black uppercase tracking-widest text-gray-500">A processar arquivo...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                                <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                                    Nenhum artigo encontrado nesta categoria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                                {posts.map((post: {
                                    id: string;
                                    slug: string;
                                    title: string;
                                    excerpt?: string;
                                    image?: string;
                                    createdAt: string;
                                    category?: { id: string; name: string; slug: string };
                                    author?: { name: string };
                                }) => (
                                    <article
                                        key={post.id}
                                        className="group flex flex-col items-start bg-transparent"
                                    >
                                        <Link href={`/blog/${post.slug}`} className="w-full">
                                            <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-900 overflow-hidden mb-6 rounded-2xl shadow-sm">
                                                {post.image ? (
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                                        <FolderOpen size={48} />
                                                    </div>
                                                )}
                                                {post.category && (
                                                    <div className="absolute top-4 left-4">
                                                        <span className="px-3 py-1 bg-white/90 dark:bg-black/90 text-[10px] font-black uppercase tracking-widest text-black dark:text-white rounded shadow-sm">
                                                            {post.category.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-full">
                                                <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-black" />
                                                        <time dateTime={post.createdAt}>
                                                            {new Date(post.createdAt).toLocaleDateString('pt-PT', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </time>
                                                    </div>
                                                </div>

                                                <h2 className="font-serif text-2xl font-bold text-black dark:text-white mb-4 line-clamp-2 leading-[1.2] group-hover:text-black transition-colors">
                                                    {post.title}
                                                </h2>

                                                {post.excerpt && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                                                        {post.excerpt}
                                                    </p>
                                                )}

                                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white">
                                                            <User size={12} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Luclima Service</span>
                                                    </div>
                                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                                                        Ler Artigo <ArrowRight size={14} className="text-black" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

             {/* <Footer /> */}
        </div>
    );
}
