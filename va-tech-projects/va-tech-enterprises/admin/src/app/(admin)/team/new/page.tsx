"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import ImageUpload from "@/components/ui/ImageUpload";

export default function NewTeamMemberPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        email: "",
        linkedin: "",
        bio: "",
        image: "",
        order: "0",
        active: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, active: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    order: parseInt(formData.order) || 0
                }),
            });

            if (!res.ok) throw new Error("Failed to create member");

            toast.success("Membro adicionado com sucesso!");
            router.push("/team");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao adicionar membro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/team">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Novo Membro</h1>
                        <p className="text-muted-foreground">Adicione um novo membro à equipa.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: João Silva" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Cargo / Função</Label>
                            <Input id="role" name="role" value={formData.role} onChange={handleChange} placeholder="Ex: CEO, Developer" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Opcional)</Label>
                            <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="joao@vatech.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL (Opcional)</Label>
                            <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Foto de Perfil</Label>
                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                            onRemove={() => setFormData(prev => ({ ...prev, image: "" }))}
                        />
                        <input type="hidden" name="image" value={formData.image} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografia Curta</Label>
                        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Breve descrição sobre o membro..." />
                    </div>

                    <div className="flex items-center gap-8 pt-4 border-t">
                        <div className="space-y-2 w-32">
                            <Label htmlFor="order">Ordem</Label>
                            <Input id="order" name="order" type="number" value={formData.order} onChange={handleChange} />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Label>Status</Label>
                            <div className="flex items-center gap-2">
                                <Switch checked={formData.active} onCheckedChange={handleSwitchChange} />
                                <span className="text-sm text-muted-foreground">{formData.active ? "Ativo" : "Inativo"}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
