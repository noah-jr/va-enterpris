"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "./input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove: () => void;
    className?: string;
}

export default function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState(value || "");

    useEffect(() => {
        if (value) setUrlInput(value);
    }, [value]);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                onChange(data.url);
            } else {
                alert("Erro: " + (data.error || "Upload falhou"));
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Erro ao enviar arquivo.");
        } finally {
            setUploading(false);
        }
    };

    if (value) {
        return (
            <div className={cn("space-y-3 w-full max-w-md", className)}>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted/20 group shadow-inner">
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            type="button"
                            onClick={onRemove}
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 shadow-lg hover:scale-105 transition-transform"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <img
                        src={value}
                        alt="Preview"
                        className="object-contain w-full h-full p-4"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = "flex items-center justify-center h-full text-muted-foreground italic text-xs p-4 text-center";
                                placeholder.innerText = "URL de imagem inválida ou bloqueada";
                                parent.appendChild(placeholder);
                            }
                        }}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="URL da imagem..."
                            className="pl-8 text-xs h-9 bg-muted/10 border-muted focus-visible:ring-primary/20"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onRemove}
                        className="h-9 px-3 text-xs"
                    >
                        Limpar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full max-w-md", className)}>
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-3 bg-muted/30 p-1 rounded-lg h-10">
                    <TabsTrigger value="upload" className="text-[10px] uppercase tracking-wider font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        Upload
                    </TabsTrigger>
                    <TabsTrigger value="link" className="text-[10px] uppercase tracking-wider font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <LinkIcon className="h-3.5 w-3.5 mr-2" />
                        Link URL
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-0 focus-visible:outline-none">
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all duration-300 bg-card/40 border-muted group overflow-hidden relative">
                        <div className="flex flex-col items-center justify-center text-center p-6 z-10">
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                                    <p className="text-sm font-medium animate-pulse">A carregar imagem...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 rounded-2xl bg-primary/5 mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                        <Upload className="w-8 h-8 text-primary/70 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="mb-1 text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                                        Clique para fazer upload
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                                        PNG, JPG, WEBP (Máx. 5MB)
                                    </p>
                                </>
                            )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={uploading} />

                        {/* Decorative background element */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </label>
                </TabsContent>

                <TabsContent value="link" className="mt-0 focus-visible:outline-none">
                    <div className="flex flex-col gap-4 p-8 border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-card border-dashed aspect-video justify-center shadow-sm">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                URL da Imagem
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="https://exemplo.com/imagem.png"
                                        className="pl-10 h-11 bg-muted/20 border-muted focus-visible:ring-primary/20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (urlInput) onChange(urlInput);
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => urlInput && onChange(urlInput)}
                                    className="h-11 px-6 font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                    Usar
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-[1px] flex-1 bg-muted/50" />
                            <p className="text-[10px] font-medium italic">
                                Insira um link direto para a imagem
                            </p>
                            <div className="h-[1px] flex-1 bg-muted/50" />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
