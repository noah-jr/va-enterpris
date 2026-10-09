"use client";

import { useState, useEffect } from "react";
import { FileText, Send, Plus, Trash2, Loader2, Download, Eye, Ban, Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface DocumentItem {
    id: string;
    type: string;
    clientName: string;
    amount: number;
    status: string;
    createdAt: string;
    data: string;
}

export default function ContractsPage() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("contract");
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

    // Contract State
    const [contractData, setContractData] = useState({
        clientName: "",
        email: "",
        service: "",
        amount: "",
    });

    // Invoice State
    const [invoiceData, setInvoiceData] = useState({
        clientName: "",
        email: "",
        items: [{ desc: "", qty: 1, price: 0 }]
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/contracts");
            const data = await res.json();
            if (Array.isArray(data)) setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContractData({ ...contractData, [e.target.name]: e.target.value });
    };

    const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems: any = [...invoiceData.items];
        newItems[index][field] = value;
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const addItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { desc: "", qty: 1, price: 0 }]
        });
    };

    const removeItem = (index: number) => {
        if (invoiceData.items.length === 1) return;
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const handleSubmit = async (type: "contract" | "invoice") => {
        setLoading(true);
        try {
            const payload = type === "contract"
                ? { type, ...contractData }
                : { type, ...invoiceData };

            const res = await fetch("/api/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Erro ao gerar documento");

            toast.success("Documento gerado com sucesso!");
            fetchDocuments(); // Refresh list

            // Open PDF in new tab instead of download if possible, or trigger download
            if (data.pdfBase64) {
                openPdfInNewTab(data.pdfBase64);
            }

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const openPdfInNewTab = (base64: string) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    // Actions
    const handleView = async (doc: DocumentItem) => {
        try {
            const res = await fetch(`/api/contracts/${doc.id}?pdf=true`);
            const data = await res.json();
            if (data.pdfBase64) {
                openPdfInNewTab(data.pdfBase64);
            } else {
                toast.error("Erro ao gerar PDF para visualização");
            }
        } catch (e) {
            toast.error("Erro de conexão");
        }
    };

    const handleCancel = async (id: string) => {
        try {
            const res = await fetch(`/api/contracts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" })
            });
            if (res.ok) {
                toast.success("Documento cancelado");
                fetchDocuments();
            }
        } catch (e) {
            toast.error("Erro ao cancelar");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem a certeza que deseja eliminar este documento?")) return;
        try {
            const res = await fetch(`/api/contracts/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Documento eliminado");
                fetchDocuments();
            }
        } catch (e) {
            toast.error("Erro ao eliminar");
        }
    };

    const handleEdit = (doc: DocumentItem) => {
        const data = JSON.parse(doc.data);
        if (doc.type === "CONTRACT") {
            setActiveTab("contract");
            setContractData({
                clientName: data.clientName || "",
                email: data.email || "",
                service: data.service || "",
                amount: data.amount || ""
            });
        } else {
            setActiveTab("invoice");
            setInvoiceData({
                clientName: data.clientName || "",
                email: data.email || "",
                items: data.items || [{ desc: "", qty: 1, price: 0 }]
            });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.info("Dados carregados para edição. Gere o documento novamente para salvar as alterações.");
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
                <p className="text-muted-foreground mt-1">Gerar, gerir e enviar contratos e faturas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Generaton Section */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="contract" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                            <TabsTrigger value="contract">Contrato</TabsTrigger>
                            <TabsTrigger value="invoice">Fatura</TabsTrigger>
                        </TabsList>

                        <TabsContent value="contract">
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Gerar Contrato</CardTitle>
                                    <CardDescription>Crie um contrato de prestação de serviços simples.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nome do Cliente</Label>
                                            <Input
                                                name="clientName"
                                                value={contractData.clientName}
                                                onChange={handleContractChange}
                                                placeholder="Empresa Lda."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email do Cliente</Label>
                                            <Input
                                                name="email"
                                                type="email"
                                                value={contractData.email}
                                                onChange={handleContractChange}
                                                placeholder="email@cliente.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Serviço Prestado</Label>
                                        <Input
                                            name="service"
                                            value={contractData.service}
                                            onChange={handleContractChange}
                                            placeholder="Ex: Desenvolvimento Web"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Valor Total (Kz)</Label>
                                        <Input
                                            name="amount"
                                            type="number"
                                            value={contractData.amount}
                                            onChange={handleContractChange}
                                            placeholder="500000"
                                        />
                                    </div>

                                    <Button
                                        className="w-full md:w-auto"
                                        onClick={() => handleSubmit("contract")}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                        Gerar e Salvar
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="invoice">
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Gerar Fatura</CardTitle>
                                    <CardDescription>Crie uma fatura pró-forma detalhada.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nome do Cliente</Label>
                                            <Input
                                                name="clientName"
                                                value={invoiceData.clientName}
                                                onChange={handleInvoiceChange}
                                                placeholder="Empresa Lda."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email do Cliente</Label>
                                            <Input
                                                name="email"
                                                type="email"
                                                value={invoiceData.email}
                                                onChange={handleInvoiceChange}
                                                placeholder="email@cliente.com"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Itens da Fatura</Label>
                                            <Button variant="outline" size="sm" onClick={addItem}>
                                                <Plus className="h-4 w-4 mr-1" /> Adicionar Item
                                            </Button>
                                        </div>

                                        {invoiceData.items.map((item, index) => (
                                            <div key={index} className="flex gap-2 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Descrição</Label>
                                                    <Input
                                                        value={item.desc}
                                                        onChange={(e) => handleItemChange(index, "desc", e.target.value)}
                                                        placeholder="Item..."
                                                    />
                                                </div>
                                                <div className="w-20 space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Qtd</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => handleItemChange(index, "qty", Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-32 space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Preço Unit.</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, "price", Number(e.target.value))}
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <div className="flex justify-end pt-4">
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Total Estimado</p>
                                                <p className="text-xl font-bold">
                                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(
                                                        invoiceData.items.reduce((acc, item) => acc + (item.qty * item.price), 0)
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full md:w-auto"
                                        onClick={() => handleSubmit("invoice")}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                        Gerar e Salvar
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* History Section */}
                <div className="lg:col-span-1">
                    <Card className="h-full border-none shadow-md flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Histórico</CardTitle>
                                <Button variant="ghost" size="sm" onClick={fetchDocuments}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription>Últimos documentos gerados</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            {loadingDocs ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
                                    <FileText className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm">Nenhum documento gerado ainda.</p>
                                </div>
                            ) : (
                                <div className="divide-y overflow-y-auto max-h-[600px]">
                                    {documents.map(doc => (
                                        <div key={doc.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{doc.clientName}</span>
                                                        <Badge variant={doc.status === "CANCELLED" ? "destructive" : "default"} className="text-[10px] h-5">
                                                            {doc.status === "CANCELLED" ? "Cancelado" : doc.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {format(new Date(doc.createdAt), "dd MMM yyyy, HH:mm")}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleView(doc)}>
                                                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(doc)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Editar (Copiar)
                                                        </DropdownMenuItem>
                                                        {doc.status !== "CANCELLED" && (
                                                            <DropdownMenuItem onClick={() => handleCancel(doc.id)} className="text-orange-500">
                                                                <Ban className="mr-2 h-4 w-4" /> Cancelar
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-500">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium">
                                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(doc.amount)}
                                                </span>
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleView(doc)}>
                                                    Abrir PDF
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
