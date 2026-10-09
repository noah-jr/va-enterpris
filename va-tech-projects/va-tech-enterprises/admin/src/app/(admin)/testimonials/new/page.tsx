"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export default function NewTestimonialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        company: "",
        content: "",
        image: "",
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
            const res = await fetch("/api/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    rating
                }),
            });

            if (!res.ok) throw new Error("Failed to create testimonial");

            toast.success("Testemunho adicionado!");
            router.push("/testimonials");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao adicionar testemunho.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/testimonials">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Novo Testemunho</h1>
                        <p className="text-muted-foreground">Adicione o feedback de um cliente.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Cliente</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Maria Santos" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Cargo</Label>
                            <Input id="role" name="role" value={formData.role} onChange={handleChange} placeholder="Ex: CEO" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Empresa (Opcional)</Label>
                            <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Ex: Tech Solutions" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Classificação</Label>
                            <div className="flex items-center font-bold text-yellow-500">
                                {rating} <Star className="h-4 w-4 fill-yellow-500 ml-1" />
                            </div>
                        </div>
                        <Slider
                            value={[rating]}
                            max={5}
                            min={1}
                            step={1}
                            onValueChange={(vals) => setRating(vals[0])}
                            className="py-4"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Depoimento</Label>
                        <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={4} placeholder="O que o cliente disse..." required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Foto do Cliente (URL)</Label>
                        <Input id="image" name="image" value={formData.image} onChange={handleChange} placeholder="/images/testimonials/..." />
                    </div>

                    <div className="flex flex-col space-y-2 pt-2">
                        <Label>Status</Label>
                        <div className="flex items-center gap-2">
                            <Switch checked={formData.active} onCheckedChange={handleSwitchChange} />
                            <span className="text-sm text-muted-foreground">{formData.active ? "Visível no site" : "Oculto"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
