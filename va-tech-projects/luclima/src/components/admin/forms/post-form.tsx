'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Camera, X } from 'lucide-react';
import { RichTextEditor } from '../rich-text-editor';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PostFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt?: string;
        image?: string;
        categoryId: string;
        status: string;
        metaTitle?: string;
        metaDescription?: string;
    };
}

interface PostFormData {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    image: string;
    categoryId: string;
    authorId: string;
    status: string;
    metaTitle: string;
    metaDescription: string;
}

export function PostForm({ onSuccess, onCancel, initialData }: PostFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PostFormData>({
        defaultValues: {
            title: initialData?.title ?? '',
            slug: initialData?.slug ?? '',
            content: initialData?.content ?? '',
            excerpt: initialData?.excerpt ?? '',
            image: initialData?.image ?? '',
            categoryId: initialData?.categoryId ?? '',
            authorId: '',
            status: initialData?.status ?? 'DRAFT',
            metaTitle: initialData?.metaTitle ?? '',
            metaDescription: initialData?.metaDescription ?? '',
        },
    });

    const title = watch('title');
    const image = watch('image');

    const { data: categoriesData } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Erro ao carregar categorias');
            return res.json();
        },
    });

    const { data: usersData } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Erro ao carregar utilizadores');
            return res.json();
        },
    });

    const categories = categoriesData?.categories ?? [];
    const users = usersData?.users ?? [];

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Falha no upload');

            setValue('image', result.url);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem de capa';
            alert(message);
        } finally {
            setUploadingImage(false);
        }
    }, [setValue]);

    const onSubmit = async (data: PostFormData) => {
        setLoading(true);
        setError('');
        try {
            const url = initialData ? `/api/posts/${initialData.id}` : '/api/posts';
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData
                ? {
                    title: data.title,
                    slug: data.slug,
                    content: data.content,
                    excerpt: data.excerpt || undefined,
                    image: data.image || undefined,
                    categoryId: data.categoryId,
                    status: data.status,
                    metaTitle: data.metaTitle || undefined,
                    metaDescription: data.metaDescription || undefined,
                }
                : {
                    title: data.title,
                    slug: data.slug,
                    content: data.content,
                    excerpt: data.excerpt || undefined,
                    image: data.image || undefined,
                    categoryId: data.categoryId,
                    authorId: data.authorId || users[0]?.id,
                    status: data.status,
                    metaTitle: data.metaTitle || undefined,
                    metaDescription: data.metaDescription || undefined,
                };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Erro ao gravar');
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao gravar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[85vh] overflow-y-auto px-1">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    <Tabs defaultValue="content">
                        <TabsList className="mb-4 w-full flex justify-start overflow-x-auto">
                            <TabsTrigger value="content" className="flex-1 sm:flex-none">Conteúdo</TabsTrigger>
                            <TabsTrigger value="seo" className="flex-1 sm:flex-none">SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content">
                            <div className="space-y-4 lg:space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Título *</label>
                                    <input
                                        {...register('title', { required: 'Título é obrigatório' })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none text-base lg:text-lg font-medium"
                                        placeholder="Título do artigo"
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Conteúdo *</label>
                                    <Controller
                                        control={control}
                                        name="content"
                                        rules={{ required: 'Conteúdo é obrigatório' }}
                                        render={({ field: { onChange, value } }) => (
                                            <RichTextEditor
                                                content={value}
                                                onChange={onChange}
                                                placeholder="Escreva o conteúdo do seu artigo aqui..."
                                            />
                                        )}
                                    />
                                    {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Resumo</label>
                                    <textarea
                                        {...register('excerpt')}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none resize-none"
                                        placeholder="Breve resumo para listagens"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="seo">
                            <div className="space-y-4 lg:space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Meta título</label>
                                    <input
                                        {...register('metaTitle')}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                        placeholder="Título para motores de busca"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Meta descrição</label>
                                    <textarea
                                        {...register('metaDescription')}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none resize-none"
                                        placeholder="Descrição para motores de busca"
                                    />
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Pré-visualização do Google:
                                    </p>
                                    <div className="mt-2 text-sm lg:text-base">
                                        <div className="text-black font-medium truncate hover:underline cursor-pointer">
                                            {watch('metaTitle') || watch('title') || 'Título do Artigo'}
                                        </div>
                                        <div className="text-green-700 text-xs lg:text-sm truncate">
                                            {typeof window !== 'undefined' ? window.location.origin : 'https://luclima.com'}/blog/{watch('slug') || 'slug-do-artigo'}
                                        </div>
                                        <div className="text-gray-600 text-xs lg:text-sm line-clamp-2">
                                            {watch('metaDescription') || watch('excerpt') || 'Descrição do artigo...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-4 lg:space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-medium text-black dark:text-white mb-4">Publicação</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black dark:text-white mb-2">Estado</label>
                                <select
                                    {...register('status')}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                >
                                    <option value="DRAFT">Rascunho</option>
                                    <option value="PUBLISHED">Publicado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black dark:text-white mb-2">Categoria *</label>
                                <select
                                    {...register('categoryId', { required: 'Categoria é obrigatória' })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                >
                                    <option value="">Selecione a categoria</option>
                                    {categories.map((c: { id: string; name: string }) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>}
                            </div>

                            {!initialData && users.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Autor *</label>
                                    <select
                                        {...register('authorId', { required: !initialData ? 'Autor é obrigatório' : false })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                                    >
                                        <option value="">Selecione o autor</option>
                                        {users.map((u: { id: string; name: string }) => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    {errors.authorId && <p className="mt-1 text-sm text-red-500">{errors.authorId.message}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-medium text-black dark:text-white mb-4">Imagem de Destaque</h3>
                        <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors bg-white dark:bg-gray-950 aspect-video flex items-center justify-center">
                            {image ? (
                                <>
                                    <Image
                                        src={image}
                                        alt="Capa"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setValue('image', '')}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    {uploadingImage ? (
                                        <Loader2 className="animate-spin mx-auto text-gray-400" size={24} />
                                    ) : (
                                        <>
                                            <Camera className="mx-auto text-gray-400 mb-2" size={24} />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Clique para adicionar</span>
                                        </>
                                    )}
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploadingImage}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-medium text-black dark:text-white mb-4">Permalinks</h3>
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">Slug URL *</label>
                            <input
                                {...register('slug', { required: 'Slug é obrigatório' })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none font-mono text-sm"
                                placeholder={title ? title.toLowerCase().replace(/\s+/g, '-') : 'url-do-artigo'}
                            />
                            {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-950 pb-2 z-10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-all disabled:opacity-50"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    <span>{initialData ? 'Atualizar' : 'Criar'} post</span>
                </button>
            </div>
        </form>
    );
}
