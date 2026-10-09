'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            try {
                const data = await apiService.getBlogPosts();
                setPosts(data);
            } catch (error) {
                console.error("Erro:", error);
            } finally {
                setLoading(false);
            }
        }
        loadPosts();
    }, []);

    return (
        <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 px-8 text-white">
            <div className="max-w-7xl mx-auto">
                <header className="mb-20 text-center">
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
                        VA <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-[10px]">BLOG</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
                        Notícias, curiosidades e novidades sobre o mundo do entretenimento em Angola.
                    </p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {posts.length > 0 ? (
                            posts.map((post: any) => (
                                <div key={post.id} className="bg-[#121212] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                                    <div className="h-72 overflow-hidden">
                                        <img
                                            src={post.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80'}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            alt={post.titulo}
                                        />
                                    </div>
                                    <div className="p-10">
                                        <div className="text-blue-500 font-bold uppercase text-xs tracking-widest mb-4">Novidades</div>
                                        <h3 className="text-3xl font-black mb-6 group-hover:text-blue-400 transition-colors leading-tight">{post.titulo}</h3>
                                        <p className="text-gray-400 text-lg mb-8 line-clamp-3">
                                            {post.conteudo}
                                        </p>
                                        <button className="text-white font-black flex items-center gap-3 hover:text-blue-500 transition-colors">
                                            Ler mais
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <p className="text-gray-500 text-2xl font-bold italic">Ainda não há publicações. Volte em breve!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
