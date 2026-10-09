"use client";

import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Search, MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface BlogViewProps {
    initialPosts: any[];
    categories: string[];
}

export default function BlogView({ initialPosts, categories }: BlogViewProps) {
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPosts = initialPosts.filter(post => {
        const postTags = post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [];
        const matchesCategory = selectedCategory === "Todos" || postTags.includes(selectedCategory);
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-muted/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />
                <div className="relative tesla-container px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                            Blog & Notícias
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Insights, novidades e artigos técnicos sobre tecnologia, segurança e marketing digital.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters & Search */}
            <section className="py-10 border-b border-border bg-background/50 sticky top-16 z-30 backdrop-blur-md">
                <div className="tesla-container px-4">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                        ? "bg-foreground text-background shadow-md"
                                        : "bg-card text-muted-foreground hover:bg-muted border border-border"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Pesquisar artigos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-20 min-h-[600px]">
                <div className="tesla-container px-4">
                    {filteredPosts.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group flex flex-col h-full bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                                >
                                    <Link href={`/blog/${post.slug}`} className="relative h-56 overflow-hidden block bg-muted">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="px-3 py-1 bg-background/90 text-foreground text-xs font-bold rounded-full backdrop-blur-md shadow-sm">
                                                {post.tags?.split(',')[0]}
                                            </span>
                                        </div>
                                        <img
                                            src={post.coverImage || '/placeholder.svg'}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </Link>

                                    <div className="flex flex-col flex-1 p-8">
                                        <div className="flex items-center text-xs text-muted-foreground mb-4 gap-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(post.createdAt).toLocaleDateString('pt-PT')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                {post.author.name}
                                            </div>
                                        </div>

                                        <Link href={`/blog/${post.slug}`} className="block mb-4">
                                            <h3 className="text-2xl font-bold group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>
                                        </Link>

                                        <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto pt-6 border-t border-border/50 flex justify-between items-center">
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Heart className="w-3.5 h-3.5" />
                                                    {post._count.likes}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    {post._count.comments}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="inline-flex items-center text-sm font-bold text-foreground hover:text-accent transition-colors"
                                            >
                                                Ler Artigo
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
                            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("Todos"); }}>Limpar Filtros</Button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
