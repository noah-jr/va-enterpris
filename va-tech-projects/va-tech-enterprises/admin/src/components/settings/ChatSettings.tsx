"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function ChatSettings() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [whatsappConfigs, setWhatsappConfigs] = useState<any[]>([]);
    const [botRules, setBotRules] = useState<any[]>([]);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [waRes, rulesRes] = await Promise.all([
                fetch("/api/chat/whatsapp"),
                fetch("/api/chat/rules")
            ]);

            if (waRes.ok) setWhatsappConfigs(await waRes.json());
            if (rulesRes.ok) setBotRules(await rulesRes.json());
        } catch (error) {
            toast.error("Erro ao carregar configurações");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddWA = () => {
        setWhatsappConfigs([...whatsappConfigs, { id: `new-${Date.now()}`, sector: "", phoneNumber: "", botName: "", isActive: true, isNew: true }]);
    };

    const handleAddRule = () => {
        setBotRules([...botRules, { id: `new-${Date.now()}`, trigger: "", response: "", sector: "", active: true, isNew: true }]);
    };

    const handleDelete = async (type: 'wa' | 'rule', id: string) => {
        if (id.toString().startsWith("new-")) {
            if (type === 'wa') setWhatsappConfigs(whatsappConfigs.filter(c => c.id !== id));
            else setBotRules(botRules.filter(r => r.id !== id));
            return;
        }

        try {
            const endpoint = type === 'wa' ? `/api/chat/whatsapp?id=${id}` : `/api/chat/rules?id=${id}`;
            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
                if (type === 'wa') setWhatsappConfigs(whatsappConfigs.filter(c => c.id !== id));
                else setBotRules(botRules.filter(r => r.id !== id));
                toast.success("Eliminado com sucesso");
            }
        } catch (error) {
            toast.error("Erro ao eliminar");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // This is a simplified save logic. In a real app, you might want to track changes.
            // For now, we'll iterate and save everything that's dirty or new.

            const waPromises = whatsappConfigs.map(config => {
                const method = config.isNew ? "POST" : "PUT";
                const { isNew, ...data } = config;
                return fetch("/api/chat/whatsapp", {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
            });

            const rulePromises = botRules.map(rule => {
                const method = rule.isNew ? "POST" : "PUT";
                const { isNew, ...data } = rule;
                return fetch("/api/chat/rules", {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
            });

            await Promise.all([...waPromises, ...rulePromises]);
            toast.success("Todas as configurações foram salvas!");
            fetchData();
        } catch (error) {
            toast.error("Erro ao salvar configurações");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Atendimento & Bot</h2>
                <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>WhatsApp & Setores</CardTitle>
                    <CardDescription>Configure os números de WhatsApp e Bots por setor.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {whatsappConfigs.map((config, index) => (
                        <div key={config.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-lg relative group">
                            <div className="space-y-2">
                                <Label>Setor</Label>
                                <Input
                                    value={config.sector}
                                    onChange={(e) => {
                                        const newConfigs = [...whatsappConfigs];
                                        newConfigs[index].sector = e.target.value;
                                        setWhatsappConfigs(newConfigs);
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Número WhatsApp</Label>
                                <Input
                                    value={config.phoneNumber}
                                    onChange={(e) => {
                                        const newConfigs = [...whatsappConfigs];
                                        newConfigs[index].phoneNumber = e.target.value;
                                        setWhatsappConfigs(newConfigs);
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nome do Bot</Label>
                                <Input
                                    value={config.botName}
                                    onChange={(e) => {
                                        const newConfigs = [...whatsappConfigs];
                                        newConfigs[index].botName = e.target.value;
                                        setWhatsappConfigs(newConfigs);
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={config.isActive}
                                        onCheckedChange={(val) => {
                                            const newConfigs = [...whatsappConfigs];
                                            newConfigs[index].isActive = val;
                                            setWhatsappConfigs(newConfigs);
                                        }}
                                    />
                                    <Label>Ativo</Label>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => handleDelete('wa', config.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full dashed border-2 border-dashed" onClick={handleAddWA}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Setor
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Regras do Bot (Palavras-Chave)</CardTitle>
                    <CardDescription>Defina respostas automáticas baseadas em termos detetados na conversa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {botRules.map((rule, index) => (
                        <div key={rule.id} className="space-y-4 border p-4 rounded-lg relative group">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Gatilho (Keyword)</Label>
                                    <Input
                                        value={rule.trigger}
                                        onChange={(e) => {
                                            const newRules = [...botRules];
                                            newRules[index].trigger = e.target.value;
                                            setBotRules(newRules);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Setor Relacionado</Label>
                                    <Input
                                        value={rule.sector || ""}
                                        onChange={(e) => {
                                            const newRules = [...botRules];
                                            newRules[index].sector = e.target.value;
                                            setBotRules(newRules);
                                        }}
                                    />
                                </div>
                                <div className="flex items-end pb-2 justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={rule.active}
                                            onCheckedChange={(val) => {
                                                const newRules = [...botRules];
                                                newRules[index].active = val;
                                                setBotRules(newRules);
                                            }}
                                        />
                                        <Label>Ativo</Label>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-50"
                                        onClick={() => handleDelete('rule', rule.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Resposta Automática</Label>
                                <Input
                                    value={rule.response}
                                    onChange={(e) => {
                                        const newRules = [...botRules];
                                        newRules[index].response = e.target.value;
                                        setBotRules(newRules);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full dashed border-2 border-dashed" onClick={handleAddRule}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Regra
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pb-12">
                <Button variant="ghost" onClick={fetchData}>Cancelar Alterações</Button>
                <Button onClick={handleSave} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Todas as Configurações
                </Button>
            </div>
        </div>
    );
}

