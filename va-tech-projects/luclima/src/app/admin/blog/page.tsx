'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { PostForm } from '@/components/admin/forms/post-form';
import { FileText, Plus, Edit, Trash2, FolderPlus, Tag } from 'lucide-react';

const statusLabels: Record<string, string> = {
    DRAFT: 'Rascunho',
    PUBLISHED: 'Publicado',
};

export default function AdminBlogPage() {
    const [postFormOpen, setPostFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<{
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt?: string;
        categoryId: string;
        status: string;
        metaTitle?: string;
        metaDescription?: string;
    } | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const queryClient = useQueryClient();

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ['admin-posts'],
        queryFn: async () => {
            const res = await fetch('/api/posts');
            if (!res.ok) throw new Error('Erro ao carregar posts');
            return res.json();
        },
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Erro ao carregar categorias');
            return res.json();
        },
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (name: string) => {
            const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao criar');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            setCategoryName('');
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao eliminar');
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
    });

    const deletePostMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao eliminar');
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
    });

    const posts = postsData?.posts ?? [];
    const categories = categoriesData?.categories ?? [];

    const handleCreatePost = () => {
        setEditingPost(null);
        setPostFormOpen(true);
    };

    const handleEditPost = (post: { id: string; title: string; slug: string; content: string; excerpt?: string; categoryId: string; status: string; metaTitle?: string; metaDescription?: string }) => {
        setEditingPost(post);
        setPostFormOpen(true);
    };

    const handlePostFormSuccess = () => {
        setPostFormOpen(false);
        setEditingPost(null);
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Blog
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Gestão de categorias e artigos
            </p>

            {/* Categorias */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
                <h2 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                    <Tag size={22} />
                    Categorias
                </h2>
                <div className="flex flex-wrap gap-3 mb-4">
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Nova categoria"
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white w-64 focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                    <button
                        type="button"
                        onClick={() => categoryName.trim() && createCategoryMutation.mutate(categoryName.trim())}
                        disabled={!categoryName.trim() || createCategoryMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        <FolderPlus size={16} />
                        Adicionar
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((c: { id: string; name: string; slug: string }) => (
                        <span
                            key={c.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm"
                        >
                            {c.name}
                            <button
                                type="button"
                                onClick={() => confirm('Eliminar categoria?') && deleteCategoryMutation.mutate(c.id)}
                                className="text-red-600 dark:text-red-400 hover:underline"
                            >
                                <Trash2 size={14} />
                            </button>
                        </span>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-sm text-gray-500">Nenhuma categoria. Crie uma para usar nos posts.</p>
                    )}
                </div>
            </div>

            {/* Posts */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                        <FileText size={22} />
                        Artigos
                    </h2>
                    <button
                        type="button"
                        onClick={handleCreatePost}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium"
                    >
                        <Plus size={18} />
                        Novo post
                    </button>
                </div>

                {postsLoading && (
                    <div className="p-12 text-center">
                        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-black dark:border-white border-r-transparent" />
                    </div>
                )}

                {!postsLoading && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categoria</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {posts.map((post: { id: string; title: string; slug: string; content: string; excerpt?: string; categoryId: string; category?: { name: string }; status: string; metaTitle?: string; metaDescription?: string }) => (
                                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-black dark:text-white">{post.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{post.category?.name ?? '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                                {statusLabels[post.status] ?? post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleEditPost({ id: post.id, title: post.title, slug: post.slug, content: post.content, excerpt: post.excerpt, categoryId: post.categoryId, status: post.status, metaTitle: post.metaTitle, metaDescription: post.metaDescription })}
                                                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mr-3"
                                            >
                                                <Edit size={18} className="inline" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => confirm('Eliminar este post?') && deletePostMutation.mutate(post.id)}
                                                className="text-red-600 dark:text-red-400 hover:underline"
                                            >
                                                <Trash2 size={18} className="inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {posts.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <FileText className="mx-auto mb-2" size={40} />
                                <p>Nenhum artigo. Crie o primeiro.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={postFormOpen}
                onClose={() => { setPostFormOpen(false); setEditingPost(null); }}
                title={editingPost ? 'Editar post' : 'Novo post'}
                size="5xl"
            >
                <PostForm
                    onSuccess={handlePostFormSuccess}
                    onCancel={() => { setPostFormOpen(false); setEditingPost(null); }}
                    initialData={editingPost ?? undefined}
                />
            </Modal>
        </div>
    );
}
