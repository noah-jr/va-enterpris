"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        content: "",
        category: "web",
        client: "",
        year: new Date().getFullYear().toString(),
        link: "",
        image: "",
        featured: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates: any = { [name]: value };
            if (name === "title" && !prev.slug) {
                updates.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return { ...prev, ...updates };
        });
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, featured: checked }));
    };

    const handleCategoryChange = (val: string) => {
        setFormData(prev => ({ ...prev, category: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create project");

            toast.success("Projeto criado com sucesso!");
            router.push("/projects");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao criar projeto.");
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-bold tracking-tight">Novo Projeto</h1>
                        <p className="text-muted-foreground">Adicione um novo projeto ao portfólio.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Projeto
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título do Projeto</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Website E-commerce" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL amigável)</Label>
                                <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="ex: website-ecommerce" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição Curta</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Resumo que aparece no card..." rows={3} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Conteúdo Detalhado (Markdown/HTML)</Label>
                                <Textarea id="content" name="content" value={formData.content} onChange={handleChange} placeholder="Detalhes completos do projeto..." rows={10} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-4">Galeria</h3>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Arraste imagens ou clique para fazer upload (Em breve)</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select value={formData.category} onValueChange={handleCategoryChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
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
                                <Input id="client" name="client" value={formData.client} onChange={handleChange} placeholder="Nome do cliente" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Ano</Label>
                                <Input id="year" name="year" value={formData.year} onChange={handleChange} placeholder="2024" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="link">Link Externo</Label>
                                <Input id="link" name="link" value={formData.link} onChange={handleChange} placeholder="https://..." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Imagem de Capa (URL)</Label>
                                <Input id="image" name="image" value={formData.image} onChange={handleChange} placeholder="/images/..." />
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
                                <Switch checked={formData.featured} onCheckedChange={handleSwitchChange} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
