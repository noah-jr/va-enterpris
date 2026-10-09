"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction, updatePostAction } from "@/lib/actions/posts";
import { Post } from "@/core/domain/entities/Post";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";
import ImageUpload from "@/components/ui/ImageUpload";
import { generateSlug } from "@/lib/utils/slug";

interface PostFormProps {
    post?: Post;
}

export default function PostForm({ post }: PostFormProps) {
    const isEdit = !!post;
    const action = isEdit ? updatePostAction.bind(null, post!.id) : createPostAction;

    const [state, dispatch, isPending] = useActionState(action, undefined);
    const [coverImage, setCoverImage] = useState(post?.coverImage || "");
    const [slug, setSlug] = useState(post?.slug || "");
    const [manualSlug, setManualSlug] = useState(!!post?.slug);

    return (
        <form action={dispatch} className="flex flex-col xl:flex-row gap-8 items-start max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Coluna Principal: Conteúdo */}
            <div className="flex-[3] w-full space-y-8 bg-white dark:bg-card p-8 rounded-[30px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-border/50">
                <div className="space-y-4">
                    <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        Título da Publicação
                    </Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        defaultValue={post?.title}
                        placeholder="Escreva um título memorável..."
                        className="h-14 rounded-2xl text-xl font-extrabold bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 transition-all px-6"
                        onChange={(e) => {
                            if (!manualSlug) {
                                setSlug(generateSlug(e.target.value));
                            }
                        }}
                    />
                </div>

                <div className="space-y-4">
                    <Label htmlFor="content" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        História Principal
                    </Label>
                    <div className="rounded-[25px] border border-border/50 overflow-hidden bg-white dark:bg-muted/10 shadow-inner">
                        <RichTextEditor value={post?.content || ''} onChange={(val) => {
                            const input = document.getElementById('content-hidden') as HTMLInputElement;
                            if (input) input.value = val;
                        }} />
                    </div>
                    <input type="hidden" id="content-hidden" name="content" defaultValue={post?.content} />
                </div>

                <div className="space-y-4">
                    <Label htmlFor="excerpt" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        Introdução Rápida (Abstract)
                    </Label>
                    <Textarea
                        id="excerpt"
                        name="excerpt"
                        defaultValue={post?.excerpt || ''}
                        placeholder="Um pequeno resumo que aparecerá nos cartões do blog..."
                        className="h-32 rounded-2xl resize-none bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 px-6 py-4"
                    />
                </div>
            </div>

            {/* Coluna Lateral: Metadados e Ações */}
            <aside className="xl:w-[400px] w-full space-y-6">
                {/* Painel de Publicação */}
                <div className="bg-white dark:bg-card p-6 rounded-[30px] border border-border/50 shadow-lg shadow-gray-200/50 dark:shadow-none space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Publicar</h3>
                        <div className={`h-2 w-2 rounded-full ${post?.published ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => {
                            const cb = document.getElementById('published') as HTMLInputElement;
                            if (cb) cb.checked = !cb.checked;
                        }}>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Estado Público</span>
                                <span className="text-[10px] text-muted-foreground uppercase">Visível no site</span>
                            </div>
                            <input
                                type="checkbox"
                                id="published"
                                name="published"
                                defaultChecked={post?.published ?? false}
                                className="h-6 w-6 rounded-lg border-border/50 text-primary focus:ring-0 cursor-pointer accent-black"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="slug" className="text-[11px] font-bold uppercase text-muted-foreground/70 px-1">Identificador da URL</Label>
                            <Input
                                id="slug"
                                name="slug"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value);
                                    setManualSlug(true);
                                }}
                                className="h-11 rounded-xl bg-muted/30 border-border/50 px-4 text-xs font-mono"
                                placeholder="url-do-artigo"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Link href="/posts" className="flex-1">
                            <Button variant="outline" type="button" className="w-full h-11 rounded-xl border-border/50 hover:bg-muted/50 transition-all text-xs font-bold uppercase tracking-tight">
                                Descartar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isPending} className="flex-[2] h-11 rounded-xl bg-foreground text-background hover:opacity-90 transition-all font-extrabold uppercase tracking-tight text-xs">
                            {isPending ? "A guardar..." : "Publicar Agora"}
                        </Button>
                    </div>
                </div>

                {/* Painel de Media */}
                <div className="bg-white dark:bg-card p-6 rounded-[30px] border border-border/50 shadow-lg shadow-gray-200/50 dark:shadow-none space-y-4">
                    <Label className="text-[11px] font-bold uppercase text-muted-foreground/70 px-1">Capa do Artigo</Label>
                    <ImageUpload
                        value={coverImage}
                        onChange={setCoverImage}
                        onRemove={() => setCoverImage("")}
                    />
                    <input type="hidden" name="coverImage" value={coverImage} />
                </div>

                {/* Painel de Organização */}
                <div className="bg-white dark:bg-card p-6 rounded-[30px] border border-border/50 shadow-lg shadow-gray-200/50 dark:shadow-none space-y-4">
                    <Label htmlFor="tags" className="text-[11px] font-bold uppercase text-muted-foreground/70 px-1">Etiquetas de Pesquisa</Label>
                    <Input
                        id="tags"
                        name="tags"
                        defaultValue={post?.tags || ''}
                        placeholder="separadas por vírgulas..."
                        className="h-11 rounded-xl bg-muted/30 border-border/50 px-4 text-xs"
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                        {post?.tags?.split(',').map((tag, i) => (
                            <span key={i} className="text-[10px] bg-primary/5 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {state?.message && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-[11px] font-bold uppercase text-center">
                        {state.message}
                    </div>
                )}
            </aside>
        </form>
    );
}
