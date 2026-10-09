"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { use } from "react";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default function EditProjectPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        content: "",
        category: "web",
        client: "",
        year: "",
        link: "",
        image: "",
        featured: false,
        active: true,
    });

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setFormData({
                    title: data.title || "",
                    slug: data.slug || "",
                    description: data.description || "",
                    content: data.content || "",
                    category: data.category || "web",
                    client: data.client || "",
                    year: data.year || "",
                    link: data.link || "",
                    image: data.image || "",
                    featured: data.featured || false,
                    active: data.active !== false,
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Erro ao carregar projeto");
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (field: "featured" | "active") => (checked: boolean) => {
        setFormData(prev => ({ ...prev, [field]: checked }));
    };

    const handleCategoryChange = (val: string) => {
        setFormData(prev => ({ ...prev, category: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update project");

            toast.success("Projeto atualizado com sucesso!");
            router.push("/projects");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao atualizar projeto.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Projeto</h1>
                        <p className="text-muted-foreground">Atualizar informações do projeto.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título do Projeto</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL amigável)</Label>
                                <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição Curta</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Conteúdo Detalhado</Label>
                                <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select value={formData.category} onValueChange={handleCategoryChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="web">Web Development</SelectItem>
                                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                        <SelectItem value="cctv">CCTV/Security</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="energy">Energy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="client">Cliente</Label>
                                <Input id="client" name="client" value={formData.client} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Ano</Label>
                                <Input id="year" name="year" value={formData.year} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="link">Link Externo</Label>
                                <Input id="link" name="link" value={formData.link} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Imagem de Capa (URL)</Label>
                                <Input id="image" name="image" value={formData.image} onChange={handleChange} />
                                {formData.image && (
                                    <div className="mt-2 relative aspect-video rounded-md overflow-hidden bg-gray-100">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="space-y-0.5">
                                    <Label>Destaque</Label>
                                    <p className="text-xs text-muted-foreground">Exibir na home?</p>
                                </div>
                                <Switch checked={formData.featured} onCheckedChange={handleSwitchChange("featured")} />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <div className="space-y-0.5">
                                    <Label>Status</Label>
                                    <p className="text-xs text-muted-foreground">Ativo no site?</p>
                                </div>
                                <Switch checked={formData.active} onCheckedChange={handleSwitchChange("active")} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
