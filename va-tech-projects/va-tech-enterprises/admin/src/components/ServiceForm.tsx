"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createServiceAction, updateServiceAction } from "@/lib/actions/services";
import { Service } from "@/core/domain/entities/Service";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";
import ImageUpload from "@/components/ui/ImageUpload";
import { generateSlug } from "@/lib/utils/slug";

interface ServiceFormProps {
    service?: Service;
}

export default function ServiceForm({ service }: ServiceFormProps) {
    const isEdit = !!service;
    const action = isEdit ? updateServiceAction.bind(null, service!.id) : createServiceAction;

    const [state, dispatch, isPending] = useActionState(action, undefined);
    const [image, setImage] = useState(service?.image || "");
    const [slug, setSlug] = useState(service?.slug || "");
    const [manualSlug, setManualSlug] = useState(!!service?.slug);

    return (
        <form action={dispatch} className="space-y-6 max-w-2xl bg-card p-6 rounded-lg border shadow-sm">
            <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={service?.title}
                    placeholder="Ex: Cibersegurança"
                    onChange={(e) => {
                        if (!manualSlug) {
                            setSlug(generateSlug(e.target.value));
                        }
                    }}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug (Gerado automaticamente)</Label>
                <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => {
                        setSlug(e.target.value);
                        setManualSlug(true);
                    }}
                    placeholder="ciberseguranca"
                />
                <p className="text-xs text-muted-foreground">Edite manualmente se necessário</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                    id="category"
                    name="category"
                    required
                    defaultValue={service?.category || "Outros"}
                    className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                    <option value="TI & Infraestrutura">TI & Infraestrutura</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                    <option value="Cibersegurança">Cibersegurança</option>
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Outros">Outros</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="icon">Ícone (Nome do Lucide Icon)</Label>
                <Input id="icon" name="icon" required defaultValue={service?.icon} placeholder="Ex: Shield, Zap, Network" />
                <p className="text-xs text-muted-foreground">Nome exato do ícone da biblioteca Lucide React.</p>
            </div>

            <div className="space-y-2">
                <Label>Imagem de Destaque</Label>
                <ImageUpload value={image} onChange={setImage} onRemove={() => setImage("")} />
                <input type="hidden" name="image" value={image} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Textarea id="description" name="description" required defaultValue={service?.description} placeholder="Resumo para o card..." />
            </div>

            <div className="space-y-2">
                <Label htmlFor="longDescription">Descrição Longa (Editor Visual)</Label>
                <RichTextEditor value={service?.longDescription || ''} onChange={(val) => {
                    const input = document.getElementById('longDescription-hidden') as HTMLInputElement;
                    if (input) input.value = val;
                }} />
                <input type="hidden" id="longDescription-hidden" name="longDescription" defaultValue={service?.longDescription || ''} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="features">Funcionalidades (Uma por linha)</Label>
                <Textarea id="features" name="features" className="min-h-[150px]" defaultValue={service?.features.join('\n')} placeholder="- Feature 1&#10;- Feature 2" />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <input
                    type="checkbox"
                    id="active"
                    name="active"
                    defaultChecked={service?.active ?? true}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-black"
                />
                <Label htmlFor="active" className="cursor-pointer">Ativo no site</Label>
            </div>

            {state?.message && (
                <div className="p-3 rounded bg-red-100 border border-red-200 text-red-600 text-sm font-medium">
                    {state.message}
                </div>
            )}

            <div className="flex gap-4 pt-6 border-t mt-6">
                <Link href="/services">
                    <Button variant="outline" type="button"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar</Button>
                </Link>
                <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {isPending ? "Salvando..." : (isEdit ? "Atualizar Serviço" : "Criar Serviço")}
                </Button>
            </div>
        </form>
    );
}
